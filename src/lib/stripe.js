import { loadStripe } from '@stripe/stripe-js'

const pk = import.meta.env.VITE_STRIPE_PK

export const stripePromise = loadStripe(pk)


