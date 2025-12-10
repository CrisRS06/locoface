import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | LocoFace',
  description: 'Privacy Policy for LocoFace AI Sticker Generator',
};

export default function PrivacyPage() {
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
              <h1 className="text-3xl font-bold text-slate-800">Privacy Policy</h1>
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
              <li><a href="#introduction" className="hover:text-coral">Introduction</a></li>
              <li><a href="#data-collected" className="hover:text-coral">Data We Collect</a></li>
              <li><a href="#how-we-use" className="hover:text-coral">How We Use Your Data</a></li>
              <li><a href="#third-parties" className="hover:text-coral">Third-Party Services</a></li>
              <li><a href="#ai-processing" className="hover:text-coral">AI Data Processing</a></li>
              <li><a href="#data-retention" className="hover:text-coral">Data Retention</a></li>
              <li><a href="#your-rights" className="hover:text-coral">Your Privacy Rights</a></li>
              <li><a href="#security" className="hover:text-coral">Data Security</a></li>
              <li><a href="#children" className="hover:text-coral">Children&apos;s Privacy</a></li>
              <li><a href="#international" className="hover:text-coral">International Transfers</a></li>
              <li><a href="#cookies" className="hover:text-coral">Cookies</a></li>
              <li><a href="#changes" className="hover:text-coral">Policy Changes</a></li>
              <li><a href="#contact" className="hover:text-coral">Contact Us</a></li>
            </ol>
          </nav>

          {/* 1. Introduction */}
          <section id="introduction">
            <h2 className="text-xl font-bold text-slate-800 mb-3">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed">
              LocoFace (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy
              Policy explains how we collect, use, disclose, and safeguard your information when you use
              our AI sticker generation service at locoface.com.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              By using LocoFace, you consent to the data practices described in this policy. If you do
              not agree with our practices, please do not use our Service.
            </p>
          </section>

          {/* 2. Data Collected */}
          <section id="data-collected">
            <h2 className="text-xl font-bold text-slate-800 mb-3">2. Data We Collect</h2>

            <h3 className="text-lg font-semibold text-slate-700 mt-4 mb-2">Photos You Upload</h3>
            <p className="text-slate-600 leading-relaxed">
              When you use LocoFace, you upload photos that you want transformed into stickers. These
              images are processed by our AI system to generate your sticker.
            </p>

            <h3 className="text-lg font-semibold text-slate-700 mt-4 mb-2">Payment Information</h3>
            <p className="text-slate-600 leading-relaxed">
              When you make a purchase, payment information (credit card, billing address) is collected
              and processed by our payment provider, LemonSqueezy. We do not store your full payment
              card details on our servers.
            </p>

            <h3 className="text-lg font-semibold text-slate-700 mt-4 mb-2">Technical Information</h3>
            <p className="text-slate-600 leading-relaxed">
              We automatically collect certain technical information, including:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4 mt-2">
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device type</li>
              <li>Operating system</li>
              <li>Pages visited and time spent</li>
              <li>Referring website</li>
            </ul>
          </section>

          {/* 3. How We Use Data */}
          <section id="how-we-use">
            <h2 className="text-xl font-bold text-slate-800 mb-3">3. How We Use Your Data</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li><strong>Generate stickers:</strong> Process your photos through our AI to create stickers</li>
              <li><strong>Process payments:</strong> Complete your purchase transactions</li>
              <li><strong>Deliver products:</strong> Provide you with download access to your stickers</li>
              <li><strong>Customer support:</strong> Respond to your inquiries and resolve issues</li>
              <li><strong>Improve our service:</strong> Analyze usage patterns to enhance the user experience</li>
              <li><strong>Security:</strong> Detect and prevent fraud or abuse</li>
            </ul>
          </section>

          {/* 4. Third Parties */}
          <section id="third-parties">
            <h2 className="text-xl font-bold text-slate-800 mb-3">4. Third-Party Services</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We share data with the following third-party services to operate LocoFace:
            </p>

            <div className="space-y-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-700">LemonSqueezy (Payment Processing)</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Processes payments and acts as our Merchant of Record. Receives payment information,
                  email, and billing details.
                </p>
                <a
                  href="https://www.lemonsqueezy.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-coral hover:underline mt-2 inline-block"
                >
                  LemonSqueezy Privacy Policy &rarr;
                </a>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-700">OpenAI (AI Image Processing)</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Processes uploaded photos to generate sticker images using AI technology.
                  See Section 5 for detailed information about AI data processing.
                </p>
                <a
                  href="https://openai.com/policies/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-coral hover:underline mt-2 inline-block"
                >
                  OpenAI Privacy Policy &rarr;
                </a>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <h4 className="font-semibold text-slate-700">Supabase (Data Storage)</h4>
                <p className="text-sm text-slate-600 mt-1">
                  Hosts our database and stores order information and generated sticker data temporarily.
                </p>
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-coral hover:underline mt-2 inline-block"
                >
                  Supabase Privacy Policy &rarr;
                </a>
              </div>
            </div>
          </section>

          {/* 5. AI Processing */}
          <section id="ai-processing">
            <h2 className="text-xl font-bold text-slate-800 mb-3">5. AI Data Processing</h2>
            <div className="bg-coral/10 border border-coral/20 rounded-xl p-4 mb-4">
              <p className="text-slate-700 font-medium">
                Important: Your photos are processed by OpenAI&apos;s AI systems
              </p>
            </div>
            <p className="text-slate-600 leading-relaxed mb-3">
              When you upload a photo to LocoFace:
            </p>
            <ol className="list-decimal list-inside text-slate-600 space-y-2 ml-4">
              <li>Your photo is sent to OpenAI&apos;s servers for AI processing</li>
              <li>OpenAI&apos;s image generation model transforms your photo into a sticker</li>
              <li>The generated sticker is returned to our servers</li>
              <li>Your original photo is not permanently stored by OpenAI for model training</li>
            </ol>
            <p className="text-slate-600 leading-relaxed mt-4">
              We use OpenAI&apos;s API services which, according to OpenAI&apos;s data usage policies, does not
              use API data to train their models by default. For more details, please review{' '}
              <a
                href="https://openai.com/policies/api-data-usage-policies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-coral hover:underline"
              >
                OpenAI&apos;s API Data Usage Policies
              </a>.
            </p>
          </section>

          {/* 6. Data Retention */}
          <section id="data-retention">
            <h2 className="text-xl font-bold text-slate-800 mb-3">6. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We retain your data for the following periods:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-600">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-2 font-semibold">Data Type</th>
                    <th className="text-left py-2 font-semibold">Retention Period</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="py-2">Uploaded photos</td>
                    <td className="py-2">Deleted immediately after sticker generation</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2">Generated stickers</td>
                    <td className="py-2">24 hours after generation (for download access)</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2">Order records</td>
                    <td className="py-2">7 years (tax/legal requirements)</td>
                  </tr>
                  <tr className="border-b border-slate-100">
                    <td className="py-2">Technical logs</td>
                    <td className="py-2">90 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. Your Rights */}
          <section id="your-rights">
            <h2 className="text-xl font-bold text-slate-800 mb-3">7. Your Privacy Rights</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Depending on your location, you may have the following rights:
            </p>

            <h3 className="text-lg font-semibold text-slate-700 mt-4 mb-2">For All Users</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-700 mt-4 mb-2">For EU/EEA Residents (GDPR)</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Right to data portability</li>
              <li>Right to restrict processing</li>
              <li>Right to object to processing</li>
              <li>Right to withdraw consent</li>
              <li>Right to lodge a complaint with a supervisory authority</li>
            </ul>

            <h3 className="text-lg font-semibold text-slate-700 mt-4 mb-2">For California Residents (CCPA/CPRA)</h3>
            <ul className="list-disc list-inside text-slate-600 space-y-1 ml-4">
              <li>Right to know what personal information is collected</li>
              <li>Right to delete personal information</li>
              <li>Right to opt-out of sale/sharing of personal information</li>
              <li>Right to non-discrimination for exercising your rights</li>
            </ul>

            <p className="text-slate-600 leading-relaxed mt-4">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:privacy@locoface.com" className="text-coral hover:underline">
                privacy@locoface.com
              </a>. We will respond within 30 days.
            </p>
          </section>

          {/* 8. Security */}
          <section id="security">
            <h2 className="text-xl font-bold text-slate-800 mb-3">8. Data Security</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We implement appropriate security measures to protect your data:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li><strong>Encryption in transit:</strong> All data is transmitted over HTTPS/TLS</li>
              <li><strong>Encryption at rest:</strong> Stored data is encrypted</li>
              <li><strong>Access controls:</strong> Limited access to personal data on a need-to-know basis</li>
              <li><strong>Secure infrastructure:</strong> We use industry-standard cloud providers</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              While we strive to protect your data, no method of transmission over the Internet is 100%
              secure. We cannot guarantee absolute security.
            </p>
          </section>

          {/* 9. Children */}
          <section id="children">
            <h2 className="text-xl font-bold text-slate-800 mb-3">9. Children&apos;s Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              LocoFace is not intended for children under 13 years of age. We do not knowingly collect
              personal information from children under 13. If you are a parent or guardian and believe
              your child has provided us with personal information, please contact us at{' '}
              <a href="mailto:privacy@locoface.com" className="text-coral hover:underline">
                privacy@locoface.com
              </a>{' '}
              and we will delete such information.
            </p>
          </section>

          {/* 10. International */}
          <section id="international">
            <h2 className="text-xl font-bold text-slate-800 mb-3">10. International Data Transfers</h2>
            <p className="text-slate-600 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own,
              including the United States, where our third-party service providers (OpenAI, Supabase)
              are located. These countries may have different data protection laws than your country
              of residence.
            </p>
            <p className="text-slate-600 leading-relaxed mt-3">
              By using LocoFace, you consent to these transfers. We ensure appropriate safeguards are
              in place to protect your data in accordance with this Privacy Policy.
            </p>
          </section>

          {/* 11. Cookies */}
          <section id="cookies">
            <h2 className="text-xl font-bold text-slate-800 mb-3">11. Cookies</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We use minimal cookies necessary for the Service to function:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
              <li><strong>Essential cookies:</strong> Required for basic site functionality</li>
              <li><strong>Session cookies:</strong> Temporary cookies that expire when you close your browser</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-3">
              We do not use advertising cookies or invasive tracking technologies.
            </p>
          </section>

          {/* 12. Changes */}
          <section id="changes">
            <h2 className="text-xl font-bold text-slate-800 mb-3">12. Policy Changes</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. Changes will be posted on this page
              with an updated &quot;Last updated&quot; date. We encourage you to review this policy periodically.
              Your continued use of LocoFace after changes are posted constitutes acceptance of the
              updated policy.
            </p>
          </section>

          {/* 13. Contact */}
          <section id="contact">
            <h2 className="text-xl font-bold text-slate-800 mb-3">13. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have questions about this Privacy Policy or want to exercise your privacy rights,
              contact us:
            </p>
            <div className="mt-3 bg-slate-50 rounded-xl p-4">
              <p className="text-slate-700">
                <strong>Privacy inquiries:</strong>{' '}
                <a href="mailto:privacy@locoface.com" className="text-coral hover:underline">
                  privacy@locoface.com
                </a>
              </p>
              <p className="text-slate-700 mt-1">
                <strong>General support:</strong>{' '}
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
            <p className="text-slate-600 leading-relaxed mt-4">
              We will respond to privacy-related requests within 30 days.
            </p>
          </section>

          {/* Footer Links */}
          <div className="pt-6 border-t border-slate-200/50 flex items-center justify-between text-sm">
            <Link href="/terms" className="text-coral hover:underline">
              &larr; Terms of Service
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
