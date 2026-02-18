'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Session } from '@supabase/supabase-js'

type Bookmark = {
  id: string
  title: string
  url: string
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  // ✅ Handle login session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ✅ Fetch bookmarks
  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) setBookmarks(data)
  }

  // ✅ Realtime listener
  useEffect(() => {
    if (!session) return

    fetchBookmarks()

    const channel = supabase
      .channel('realtime-bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
        },
        () => {
          fetchBookmarks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black text-white">
      <h1 className="text-4xl font-bold">
        Smart Bookmark App 🚀
      </h1>

      {session ? (
        <>
          <p>Welcome {session.user.email}</p>

          <form
            onSubmit={async (e: React.FormEvent<HTMLFormElement>) => {
              e.preventDefault()

              const form = e.currentTarget
              const formData = new FormData(form)

              const title = formData.get('title') as string
              const url = formData.get('url') as string

              await supabase.from('bookmarks').insert([
                {
                  title,
                  url,
                  user_id: session.user.id,
                },
              ])

              form.reset()
            }}
            className="flex flex-col gap-3 w-80"
          >
            <input
              name="title"
              placeholder="Enter bookmark title"
              required
              className="border border-white bg-transparent text-white placeholder-gray-400 p-2 rounded"
            />

            <input
              name="url"
              placeholder="Enter bookmark URL"
              required
              className="border border-white bg-transparent text-white placeholder-gray-400 p-2 rounded"
            />

            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Add Bookmark
            </button>
          </form>

          {/* Display Bookmarks */}
          <div className="mt-6 w-80">
         {bookmarks.map((bookmark) => (
  <div
    key={bookmark.id}
    className="border border-white p-3 rounded mb-2 flex justify-between items-center"
  >
    <div>
      <h3 className="font-bold">{bookmark.title}</h3>
      <a
        href={bookmark.url}
        target="_blank"
        className="text-blue-400 underline"
      >
        {bookmark.url}
      </a>
    </div>

    <button
      onClick={async () => {
        await supabase
          .from('bookmarks')
          .delete()
          .eq('id', bookmark.id)
      }}
      className="bg-red-500 px-3 py-1 rounded"
    >
      Delete
    </button>
  </div>
))}
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded mt-4"
          >
            Logout
          </button>
        </>
      ) : (
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Sign in with Google
        </button>
      )}
    </main>
  )
}
