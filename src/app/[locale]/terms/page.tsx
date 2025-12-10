import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | LocoFace',
  description: 'Terms of Service for LocoFace AI Sticker Generator',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen gradient-bg-soft">
      {/* Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-lavender rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-40 -right-40 w-80 h-80 bg-soft-pink rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-coral transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to LocoFace
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <Image
              src="/logo-full.png"
              alt="LocoFace"
              width={60}
              height={60}
              className="drop-shadow-md"
            />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Terms of Service</h1>
              <p className="text-sm text-slate-500">Last updated: December 6, 2025</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="glass rounded-3xl p-8 space-y-8">
          {/* Table of Contents */}
          <nav className="pb-6 border-b border-slate-200/50">
            <p className="text-sm font-semibold text-slate-700 mb-3">Contents</p>
            <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
              <li><a href="#acceptance" className="hover:text-coral">Acceptance of Terms</a></li>
              <li><a href="#service" className="hover:text-coral">Service Description</a></li>
              <li><a href="#ai-disclosure" className="hover:text-coral">AI Technology Disclosure</a></li>
              <li><a href="#payment" className="hover:text-coral">Payment & Pricing</a></li>
              <li><a href="#refunds" className="hover:text-coral">Refund Policy</a></li>
              <li><a href="#ip" className="hover:text-coral">Intellectual Property</a></li>
              <li><a href="#user-responsibilities" className="hover:text-coral">User Responsibilities</a></li>
              <li><a href="#acceptable-use" className="hover:text-coral">Acceptable Use</a></li>
              <li><a href="#liability" className="hover:text-coral">Limitation of Liability</a></li>
              <li><a href="#termination" className="hover:text-coral">Termination</a></li>
              <li><a href="#changes" className="hover:text-coral">Changes to Terms</a></li>
              <li><a href="#contact" className="hover:text-coral">Contact Us</a></li>
            </ol>
          </nav>

          {/* 1. Acceptance */}
          <section id="acceptance">
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By accessing or using LocoFace (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use our Service. These terms apply to all
              visitors, users, and others who access or use LocoFace.
            </p>
          </section>

          {/* 2. Service Description */}
          <section id="service">
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Service Description</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              LocoFace is an AI-powered service that transforms photographs into cute chibi/kawaii-style
              digital stickers. Users upload a photo, and our AI technology generates a stylized sticker
              version of that image.
            </p>
            <p className="text-slate-600 leading-relaxed">
              The Service provides digital sticker files for personal use. Each purchase grants you a
              downloadable PNG file of your generated sticker.
            </p>
          </section>

          {/* 3. AI Disclosure */}
          <section id="ai-disclosure">
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. AI Technology Disclosure</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              <strong>Important:</strong> LocoFace uses artificial intelligence technology provided by
              OpenAI to generate stickers. When you upload a photo:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Your image is processed by OpenAI&apos;s image generation models</li>
              <li>The AI analyzes your photo and creates a stylized sticker version</li>
              <li>Results may vary in quality and accuracy</li>
              <li>The AI output is not guaranteed to be identical to your original photo</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              By using LocoFace, you acknowledge and consent to your photos being processed by AI technology.
              For more information about OpenAI&apos;s data practices, please review{' '}
              <a
                href="https://openai.com/policies/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral hover:underline"
              >
                OpenAI&apos;s Privacy Policy
              </a>.
            </p>
          </section>

          {/* 4. Payment */}
          <section id="payment">
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Payment & Pricing</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Stickers are priced at <strong>$2.99 USD</strong> per generation. All payments are processed
              securely through <strong>LemonSqueezy</strong>, our Merchant of Record.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
              <p className="font-semibold mb-2">Merchant of Record Disclosure:</p>
              <p>
                LemonSqueezy acts as the Merchant of Record for all purchases. This means LemonSqueezy
                is the entity that processes your payment, handles billing inquiries, and manages
                transaction-related matters. LocoFace provides the digital product (sticker) which
                is licensed to you upon successful payment.
              </p>
            </div>
            <p className="text-slate-600 leading-relaxed mt-3">
              Prices may change at any time. Applicable taxes are calculated at checkout based on your location.
            </p>
          </section>

          {/* 5. Refunds */}
          <section id="refunds">
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. Refund Policy</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We offer a <strong>14-day money-back guarantee</strong>. If you are not satisfied with your
              sticker for any reason, you may request a full refund within 14 days of purchase.
            </p>
            <p className="text-slate-600 leading-relaxed mb-3">
              To request a refund:
            </p>
            <ol className="list-decimal list-inside text-slate-600 space-y-1 ml-4">
              <li>Contact us at <a href="mailto:support@locoface.com" className="text-coral hover:underline">support@locoface.com</a></li>
              <li>Include your order number or email used for purchase</li>
              <li>Briefly describe the reason for your refund request</li>
            </ol>
            <p className="text-slate-600 leading-relaxed mt-3">
              Refunds are processed within 5-10 business days and will be returned to the original payment method.
            </p>
          </section>

          {/* 6. IP */}
          <section id="ip">
            <h2 className="text-xl font-bold text-slate-800 mb-3">6. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              <strong>Your Content:</strong> You retain all rights to the original photos you upload.
              The generated sticker is licensed to you for personal, non-commercial use.
            </p>
            <p className="text-slate-600 leading-relaxed mb-3">
              <strong>Our Technology:</strong> LocoFace and its underlying technology, including but not
              limited to our website, branding, and proprietary processes, remain the exclusive property
              of LocoFace.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong>Usage Rights:</strong> You may use generated stickers for personal purposes such as
              messaging apps, social media profiles, and personal projects. Commercial use, redistribution,
              or resale of generated stickers is not permitted without explicit written permission.
            </p>
          </section>

          {/* 7. User Responsibilities */}
          <section id="user-responsibilities">
            <h2 className="text-xl font-bold text-slate-800 mb-3">7. User Responsibilities</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              By using LocoFace, you represent and warrant that:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>You have the legal right to use any photos you upload</li>
              <li>Photos of other people are uploaded only with their consent</li>
              <li>You will not upload illegal, harmful, or offensive content</li>
              <li>You are at least 13 years old (or have parental consent)</li>
              <li>You will not attempt to reverse engineer or exploit our Service</li>
            </ul>
          </section>

          {/* 8. Acceptable Use */}
          <section id="acceptable-use">
            <h2 className="text-xl font-bold text-slate-800 mb-3">8. Acceptable Use</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              You agree NOT to use LocoFace to:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>Upload photos of people without their consent</li>
              <li>Create content that harasses, defames, or harms others</li>
              <li>Generate stickers for illegal purposes or fraud</li>
              <li>Upload copyrighted or trademarked images without authorization</li>
              <li>Attempt to bypass payment or abuse promotional codes</li>
              <li>Use automated systems to access the Service</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              We reserve the right to refuse service and terminate accounts that violate these policies.
            </p>
          </section>

          {/* 9. Liability */}
          <section id="liability">
            <h2 className="text-xl font-bold text-slate-800 mb-3">9. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind.
              LocoFace does not guarantee that:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li>The Service will be uninterrupted or error-free</li>
              <li>Generated stickers will meet your expectations</li>
              <li>AI outputs will be accurate or consistent</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              To the maximum extent permitted by law, LocoFace&apos;s liability for any claim arising from
              your use of the Service is limited to the amount you paid for the specific sticker in question
              (maximum $2.99 USD).
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              We are not liable for any indirect, incidental, special, or consequential damages.
            </p>
          </section>

          {/* 10. Termination */}
          <section id="termination">
            <h2 className="text-xl font-bold text-slate-800 mb-3">10. Termination</h2>
            <p className="text-slate-600 leading-relaxed">
              We may suspend or terminate your access to LocoFace at any time, with or without cause,
              and with or without notice. This includes, but is not limited to, violations of these
              Terms of Service. Upon termination, your right to use the Service ceases immediately.
            </p>
          </section>

          {/* 11. Changes */}
          <section id="changes">
            <h2 className="text-xl font-bold text-slate-800 mb-3">11. Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We reserve the right to modify these Terms at any time. Changes will be posted on this
              page with an updated &quot;Last updated&quot; date. Your continued use of LocoFace after changes
              are posted constitutes acceptance of the modified terms.
            </p>
          </section>

          {/* 12. Contact */}
          <section id="contact">
            <h2 className="text-xl font-bold text-slate-800 mb-3">12. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-3 bg-slate-50 rounded-xl p-4">
              <p className="text-slate-700">
                <strong>Email:</strong>{' '}
                <a href="mailto:support@locoface.com" className="text-coral hover:underline">
                  support@locoface.com
                </a>
              </p>
              <p className="text-slate-700 mt-1">
                <strong>Website:</strong>{' '}
                <a href="https://locoface.com" className="text-coral hover:underline">
                  locoface.com
                </a>
              </p>
            </div>
          </section>

          {/* Footer Links */}
          <div className="pt-6 border-t border-slate-200/50 flex items-center justify-between text-sm">
            <Link href="/privacy" className="text-coral hover:underline">
              Privacy Policy &rarr;
            </Link>
            <Link href="/" className="text-slate-500 hover:text-coral">
              Back to LocoFace
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
