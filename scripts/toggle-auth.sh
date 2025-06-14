#!/bin/bash

# Development Authentication Toggle Script

case "$1" in
  "mock")
    echo "🔓 Enabling MOCK authentication (no login required)"
    echo "NEXT_PUBLIC_ENABLE_MOCK_AUTH=true" > .env.local
    echo "NEXT_PUBLIC_MOCK_USER_ID=1" >> .env.local
    echo "✅ Mock authentication enabled - restart your dev server"
    ;;
  "real")
    echo "🔐 Enabling REAL authentication (login required)"
    echo "NEXT_PUBLIC_ENABLE_MOCK_AUTH=false" > .env.local
    echo "✅ Real authentication enabled - restart your dev server"
    echo "📝 You'll need to create a sign-in page and configure NextAuth properly"
    ;;
  "user")
    if [ -z "$2" ]; then
      echo "❌ Please specify a user ID: ./toggle-auth.sh user <user_id>"
      exit 1
    fi
    echo "👤 Setting mock user to ID: $2"
    echo "NEXT_PUBLIC_ENABLE_MOCK_AUTH=true" > .env.local
    echo "NEXT_PUBLIC_MOCK_USER_ID=$2" >> .env.local
    echo "✅ Mock user $2 enabled - restart your dev server"
    ;;
  *)
    echo "🔐 Development Authentication Toggle"
    echo ""
    echo "Usage: $0 [mock|real|user <id>]"
    echo ""
    echo "Commands:"
    echo "  mock     - Enable mock authentication (no login required)"
    echo "  real     - Enable real authentication (login required)"
    echo "  user <id> - Set specific mock user ID"
    echo ""
    echo "Examples:"
    echo "  $0 mock      # Use mock user ID 1"
    echo "  $0 real      # Require actual login"
    echo "  $0 user 5    # Use mock user ID 5"
    echo ""
    exit 1
    ;;
esac 