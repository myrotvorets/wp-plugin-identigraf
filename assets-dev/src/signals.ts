import { computed, signal } from '@preact/signals';

export const token = signal( '' );
export const hasToken = computed( () => token.value !== '' );
