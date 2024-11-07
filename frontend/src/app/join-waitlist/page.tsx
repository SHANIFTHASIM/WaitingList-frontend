"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import confetti from "canvas-confetti"
import { useEffect, useState } from "react"

// Define validation schema
const FormSchema = z.object({
  email: z.string().email({ message: "A valid email is required" }),
})

export default function InputForm() {
  const [joinCount, setJoinCount] = useState(0)
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  })

  // Fetch the join count on component mount
  useEffect(() => {
    async function fetchJoinCount() {
      const res = await fetch("http://127.0.0.1:8000/waitlist/count")
      const data = await res.json()
      setJoinCount(data.count)
    }
    fetchJoinCount()

    // Background confetti animation on mount
    const confettiInterval = setInterval(() => {
      confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks: 200,
        gravity: 0.5,
        spread: 60,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2
        },
        colors: ["#ff8b8b", "#ffda79", "#85f7ff", "#b28dff"]
      })
    }, 300)

    return () => clearInterval(confettiInterval)
  }, [])

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await fetch("http://127.0.0.1:8000/waitlist/join/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setJoinCount((prev) => prev + 1) // Update join count

        toast({
          title: "🎉 Joined successfully",
          description: "🎉 Thank you for joining!",
        })

        // Big confetti celebration on successful join
        confetti({
          particleCount: 250,
          spread: 150,
          startVelocity: 30,
          origin: { y: 0.6 },
          colors: ["#ff8b8b", "#ffda79", "#85f7ff", "#b28dff"],
        })
      } else {
        const errorData = await response.json()
        console.log("Error Data:", errorData) // Log for debugging

        // Check if errorData has the specific email error in array format
        if (errorData.email && Array.isArray(errorData.email) && errorData.email[0] === "waitlist entry with this email already exists.") {
          toast({
            title: "Already on the Waitlist 🎉",
            description: `The email ${data.email} is already registered!`,
            variant: "default",
          })
        } else if (errorData.detail) {
          // Handle any generic error message sent by the backend
          toast({
            title: "🚫 Error",
            description: errorData.detail,
            variant: "destructive",
          })
        } else {
          // Generic fallback for unknown errors
          toast({
            title: "🚫 Oops!",
            description: "There was an issue with your submission.",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "📡 Network Error",
        description: "Could not reach the server. Please try again!",
        variant: "destructive",
      })
      console.error("Network Error:", error) // Log network errors for debugging
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 overflow-hidden">

      {/* Animated Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80 animate-pulse"></div>

      {/* Join Count Display */}
      <div className="absolute top-10 w-full text-center z-10">
        <div className="text-4xl font-semibold text-white">🎉 {joinCount} people have joined! 🎉</div>
      </div>

      {/* Form Container */}
      <div className="relative z-10 p-4 text-center">
        <h1 className="text-5xl font-bold text-white mb-6 drop-shadow-md">Hello Fellas!</h1>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-7 max-w-md space-y-6 p-6 mx-auto bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 shadow-xl rounded-2xl"
          >
            <div className="text-3xl font-bold text-white mb-4">🎈 Join Our Waitlist!</div>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-semibold text-white">📧 Your Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="yourname@example.com"
                      className="mt-2 w-full border-none rounded-lg p-3 text-center text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-pink-300"
                    />
                  </FormControl>
                  <FormDescription className="text-sm text-gray-100 mt-2">
                    Be the first to know about our exciting launch! 🚀
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-3 rounded-lg transition duration-300 transform hover:scale-105 focus:ring-4 focus:ring-yellow-300 font-bold text-lg shadow-lg"
            >
              🎉 JOIN THE FUN 🎉
            </Button>
            <div className="text-white text-sm mt-4 italic">Pssst... We'll keep it a secret! 🤫</div>
          </form>
        </Form>
      </div>
    </div>
  )
}





