# Configuration
  
## Env vars

This web app supports the following env vars:

| Env var                               | Description                                                                           |
| ------------------------------------- | ------------------------------------------------------------------------------------- |
| NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID | The `project_id` to setup the [Walletconnect](https://walletconnect.com/) user wallet |
| NEXT_PUBLIC_WHITELISTED_CHAIN_IDS     | The whitelisted chain ids to show with walletconnect                                  |

# Prerequisites

This project is using [NPM](https://www.npmjs.com/) and Node v16.x

1. Create the `.env` file and fill it with values in the `.env.example`
2. Create an account on [Walletconnect](https://walletconnect.com/) in order to get the `project id` and assign that value to the `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` env variable.
3. Create the `NEXT_PUBLIC_WHITELISTED_CHAIN_IDS` env variable and set the default network id (ex: `80001` for Polygon Mumbai or `137` for Polygon Mainnet). If the user doesn't have that network configured or is connected to another unsupported chain, the default chainId will be proposed to the user. You can also specify multiple chain ids separated by a comma (`80001,137`), the first will be the default network (which will be proposed to the user first)

# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
