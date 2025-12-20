import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog.jsx'
import { Mail, Loader2, CheckCircle } from 'lucide-react'

const EmailCaptureDialog = ({ isOpen, onClose, purchaseType, walletAddress }) => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('')

    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setSubmitStatus('❌ Please enter a valid email address')
        setIsSubmitting(false)
        return
      }

      // Create email capture record
      const emailData = {
        email: email,
        wallet: walletAddress,
        purchaseType: purchaseType,
        timestamp: new Date().toISOString(),
        timestampReadable: new Date().toLocaleString()
      }

      // Save to localStorage
      const existingEmails = JSON.parse(localStorage.getItem('hvna-email-captures') || '[]')

      // Check if email already exists
      const emailExists = existingEmails.some(entry => entry.email === email)

      if (!emailExists) {
        existingEmails.push(emailData)
        localStorage.setItem('hvna-email-captures', JSON.stringify(existingEmails))
        console.log('📧 Email captured:', emailData)
      } else {
        console.log('📧 Email already exists:', email)
      }

      // Also send to Google Sheets webhook (if available in future)
      // This allows you to collect emails in a spreadsheet
      try {
        // You can add a Google Sheets webhook URL here later
        // await fetch('YOUR_WEBHOOK_URL', { method: 'POST', body: JSON.stringify(emailData) })
      } catch (webhookError) {
        // Silently fail if webhook doesn't exist
        console.log('Webhook not configured (this is OK)')
      }

      // Show success
      setIsSuccess(true)
      setSubmitStatus('✅ Thank you! You\'re on the list!')

      // Close dialog after 2 seconds
      setTimeout(() => {
        onClose()
        setEmail('')
        setIsSuccess(false)
        setSubmitStatus('')
      }, 2000)

    } catch (error) {
      console.error('Email capture error:', error)
      setSubmitStatus('❌ Failed to save email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    onClose()
    setEmail('')
    setSubmitStatus('')
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-purple-600" />
            Stay Connected!
          </DialogTitle>
          <DialogDescription>
            Join our community to receive updates about your purchase, exclusive offers, and project news.
          </DialogDescription>
        </DialogHeader>

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {submitStatus && (
              <p className="text-sm font-medium">{submitStatus}</p>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Join Community'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isSubmitting}
              >
                Skip
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mb-3" />
            <p className="text-lg font-semibold text-green-600">
              You're all set!
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EmailCaptureDialog
