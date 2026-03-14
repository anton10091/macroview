// app/api/auth/telegram/route.js
// Верифицирует данные от Telegram Login Widget и создаёт/находит пользователя
//
// Переменные окружения (добавь в Vercel + .env.local):
//   TELEGRAM_BOT_TOKEN     — токен от BotFather
//   SUPABASE_SERVICE_ROLE_KEY — service role key из Supabase → Settings → API

import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function verifyTelegramAuth(data) {
  const { hash, ...rest } = data
  const token = process.env.TELEGRAM_BOT_TOKEN
  const secret = crypto.createHash('sha256').update(token).digest()
  const checkString = Object.keys(rest)
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join('\n')
  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex')
  return hmac === hash
}

export async function POST(req) {
  try {
    const tgUser = await req.json()

    // Проверяем подпись Telegram
    if (!verifyTelegramAuth(tgUser)) {
      return Response.json({ error: 'Invalid Telegram auth data' }, { status: 401 })
    }

    // Проверяем свежесть данных (не старше 1 часа)
    const authDate = parseInt(tgUser.auth_date)
    if (Date.now() / 1000 - authDate > 3600) {
      return Response.json({ error: 'Auth data expired' }, { status: 401 })
    }

    const telegramId = tgUser.id
    const email = `tg_${telegramId}@macroview.app` // синтетический email
    const displayName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ')

    // Ищем существующего пользователя по telegram_id
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('telegram_id', telegramId)
      .single()

    let userId

    if (existingProfile) {
      userId = existingProfile.id
    } else {
      // Создаём нового пользователя в auth.users
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: displayName,
          telegram_id: telegramId,
          telegram_username: tgUser.username,
          avatar_url: tgUser.photo_url,
        },
      })
      if (createError) throw createError
      userId = newUser.user.id

      // Обновляем профиль telegram данными
      await supabaseAdmin.from('user_profiles').upsert({
        id: userId,
        email,
        telegram_id: telegramId,
        telegram_username: tgUser.username,
        display_name: displayName,
        avatar_url: tgUser.photo_url,
      })
    }

    // Создаём сессию
    const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.createSession({ userId })
    if (sessionError) throw sessionError

    return Response.json({
      access_token: session.session.access_token,
      refresh_token: session.session.refresh_token,
    })

  } catch (err) {
    console.error('Telegram auth error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
