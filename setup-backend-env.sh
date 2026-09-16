#!/bin/bash

# Backend Environment Variables Setup Script
# Generated from Vly for Git Sync
# Run this script to set up your Convex backend environment variables

echo 'Setting up Convex backend environment variables...'

# Check if Convex CLI is installed
if ! command -v npx &> /dev/null; then
    echo 'Error: npx is not installed. Please install Node.js and npm first.'
    exit 1
fi

echo "Setting JWKS..."
bunx convex env set "JWKS" -- "{\"keys\":[{\"kty\":\"RSA\",\"n\":\"62Ea1XCFvHAwdnrHoWyF2ZeE-e5bHNYik46cPCr-yl59-NBoNRrmx_Xizk9-exF1YIfgvBUSG6KQP-gIaCWgSGWXCUPY0F5iWLfhlKpbGTVLCuHJLB8uo2FImnqZI1XcQItAlELMwEIt0d-DSmbc3JtlL46etd6BIpwj5PuE-d5VwRaVACON696bcysnsQDDqhmvsok1EfneSq2_G6dIHX0PnnI3X1hAKeXamM5SQ51KbTfnuDjlxysE1Km3yEkBUgMe3RFb4W9qp3zineK6cTRyD9Sz4fLC7yZUKZtvIjQ7e1RSGwDhdFFopvsKm19c0_LHAYQAPhRqFnVyFirx9Q\",\"e\":\"AQAB\",\"use\":\"sig\"}]}"

echo "Setting JWT_PRIVATE_KEY..."
bunx convex env set "JWT_PRIVATE_KEY" -- "-----BEGIN PRIVATE KEY----- MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDrYRrVcIW8cDB2 esehbIXZl4T57lsc1iKTjpw8Kv7KXn340Gg1GubH9eLOT357EXVgh+C8FRIbopA/ 6AhoJaBIZZcJQ9jQXmJYt+GUqlsZNUsK4cksHy6jYUiaepkjVdxAi0CUQszAQi3R 34NKZtzcm2Uvjp613oEinCPk+4T53lXBFpUAI43r3ptzKyexAMOqGa+yiTUR+d5K rb8bp0gdfQ+ecjdfWEAp5dqYzlJDnUptN+e4OOXHKwTUqbfISQFSAx7dEVvhb2qn fOKd4rpxNHIP1LPh8sLvJlQpm28iNDt7VFIbAOF0UWim+wqbX1zT8scBhAA+FGoW dXIWKvH1AgMBAAECggEACkWWkjHy5CJROxpok9bUkIZYOz/3oe6GW8Ihd065B8PP 44fUxFyELb3BRBecAWrloGzNleelfqc9fEx38XOS5xXn3XOkhpNX319G7OHyT8tP lw37ZX2G34JjVLp87FnW3so060NvBATfUwVaCWkrwkTVyZmDu5QWNphxyJBhYTYJ Qxyi4lLwrO2v65sDvBKrZqtcNnYyyVXDj4jttVFT3G9laOI3Rky+MxjW7KifpgDV AMeKjbb5X2ZSFeM41psGZD/MJBOYZS6DLGgsjcK7oopQFuzbAEtXj0kgphFkWLbq m/mGeIvDZ1nVeaPb+v7iNpPjeiXMCyZXCDIBzaKTgQKBgQD27L7ifBoOzBhYRo/G O9rEJzEED0Q6Kf+mb63HGByDeWpVzta5wbxO4YTG7YHFE96yNRFgCDT8p3cCV0jq SPQqjCf3vDj9VMzI2zcu2bSWzpeB1X1qspsIvzwexT6HhPxQi/lmV+N0C1zF5s3F OQf1b3mdC9bdg1yVNg0kPhzz/QKBgQD0B7sN6Nd106h4DHp/+Qz7c/tjgh0gLy2y MIcyiBqYcafdO2lZw+sGa+lPU/oso1lbkOVtFH0CsLzT7PheVz4xbCZOhjHWbIJg X3xlij3Eo97w1Undq1+eBlIL7mJq07TvVKtC8GLkW/SP0lFJyHwsivQlexymC8e/ hnImfctLWQKBgQCm8o5k5u9fTdKv7JVMvC8/LBhR3FiO0tKMnzlpQP4WTkL83SoE 0d4Vnxh8vxxcOQD6kDK9MQ9SO4+VP5qG/OhI1BY5w0Ls1SbYLo7y2DLnO6roF4YC W9vCYDmvvEB4tAs8Ekd/ULDyRrRlAZXiYJrm8IXTDqwpfKVeJPtho7VDqQKBgDL/ apf9kQmOsiZkdTVJVu01z9N73ZpcQbB7c8Wbq/MvzWTuhZW82+D7rEZnxmCNwp7g KRIitf1Z8hxX6Y/Nq7GoaFkAsmmdQ6HgUp7lxQLTPEQYTteEePcNWxgjOW4Z0DYz +5aBpikTDoj/6v0AaPLmFx++Gr6Yt6XO8wwYPeQBAoGAJweSCizab5/m89fR0kAX CzcdYy6SGKqSRd+SM/y/AzdWTkwu2uBTOWMkT+3xBhJaJMkwB385dUJELvCHYEj8 f+jVG2NI+0U+I0sBRx2xLfFhM3xTJU7RXviX7tSOZn2aimfQ4WNxs7JuUrxui3iG H3TsQgLquw0CgvaQfwPl5H8= -----END PRIVATE KEY-----"

echo "Setting SITE_URL..."
bunx convex env set "SITE_URL" -- "https://zany-shrimp-635.convex.site"

echo "Setting VLY_APP_NAME..."
bunx convex env set "VLY_APP_NAME" -- "Clay Commerce"

echo "Setting VLY_CONVEX_AUTH_ISSUER..."
bunx convex env set "VLY_CONVEX_AUTH_ISSUER" -- "https://freebuff.com"

echo "Setting VLY_INTEGRATION_BASE_URL..."
bunx convex env set "VLY_INTEGRATION_BASE_URL" -- "https://integrations.vly.ai/"

echo "Setting VLY_INTEGRATION_KEY..."
bunx convex env set "VLY_INTEGRATION_KEY" -- "sk_3351a3a106ca373623dd90aef89083446158fbe33cc9812ec538758999a7fd63"

echo "✅ All backend environment variables have been set!"
echo "You can now run: pnpm dev:backend"
