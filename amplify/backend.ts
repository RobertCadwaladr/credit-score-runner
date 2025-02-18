import { defineBackend } from '@aws-amplify/backend';
import { creditScoreStack } from './credit-score/creditScoreStack';

const backend = defineBackend({
});

export type Backend = typeof backend;

new creditScoreStack(backend, 'credit-score-stack');