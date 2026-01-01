'use server';

/**
 * @fileOverview Provides personalized accessory recommendations based on user browsing history and purchase behavior.
 *
 * - getPersonalizedRecommendations - A function that returns personalized accessory recommendations.
 * - PersonalizedRecommendationsInput - The input type for the getPersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the getPersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  browsingHistory: z.array(z.string()).describe('The user\'s browsing history (list of product IDs).'),
  purchaseHistory: z.array(z.string()).describe('The user\'s purchase history (list of product IDs).'),
  userCharacteristics: z.string().describe('characteristics of the user'),
});
export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendedProducts: z.array(z.string()).describe('A list of recommended product IDs.'),
});
export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function getPersonalizedRecommendations(
  input: PersonalizedRecommendationsInput
): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}

const productSuggestionTool = ai.defineTool({
    name: 'productSuggestionTool',
    description: 'Suggests products for the current user, that are purchased by users with similar characteristics.',
    inputSchema: z.object({
      userCharacteristics: z.string().describe('The characteristics of the current user.'),
    }),
    outputSchema: z.array(z.string()).describe('list of product IDs for the current user'),
  },
  async (input) => {
    const {
      userCharacteristics,
    } = input
    // TODO: Implement tool to query database or external service for product recommendations.
    // This is a placeholder; replace with actual implementation.
    console.log("User characteristics in tool: " + userCharacteristics)
    return ['product123', 'product456', 'product789'];
  }
);


const personalizedRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  tools: [productSuggestionTool],
  prompt: `Based on the user's browsing history: {{browsingHistory}}, purchase history: {{purchaseHistory}} and their characteristics: {{userCharacteristics}}, recommend relevant mobile accessories.

  Consider what accessories would complement their previous purchases and browsing activity.
  Use the productSuggestionTool tool to find the recommended products.
  Return a JSON array of product IDs.
  `,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await personalizedRecommendationsPrompt(input);
    return output!;
  }
);



