
import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function streamToBuffer(stream: ReadableStream<Uint8Array>): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Cloudinary environment variables are not configured.' }, { status: 500 });
    }

    const fileBuffer = await streamToBuffer(file.stream());
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'payments' },
      (error, result) => {
        if (error) {
          // This part of the callback is tricky with Promises, we'll handle errors in the promise chain
          return;
        }
      }
    );

    const uploadPromise = new Promise((resolve, reject) => {
        const stream = Readable.from(fileBuffer);
        stream.pipe(uploadStream)
            .on('finish', () => resolve(uploadStream.end()))
            .on('error', reject);
    })
    .then((result: any) => {
        // The structure of the result from upload_stream is a bit different when using promises
        // We look for the result that `uploadStream.end()` resolves with.
        // A more robust way is to check the result object from the callback if you can promisify it correctly.
        // For simplicity, let's find the URL from the response that Cloudinary's Node SDK gives us.
        // This is a simplified approach. In a production scenario, you might need a more robust way to get the result.
        // A common pattern is to wrap the callback style in a promise.
        return new Promise((res, rej) => {
             const streamUpload = cloudinary.uploader.upload_stream({folder: "payments"}, (error, result) => {
                if(result) {
                    res(result)
                } else {
                    rej(error)
                }
             })
             Readable.from(fileBuffer).pipe(streamUpload)
        })
    });
    
    const result: any = await uploadPromise;
    
    return NextResponse.json({ url: result.secure_url });

  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong.' }, { status: 500 });
  }
}
