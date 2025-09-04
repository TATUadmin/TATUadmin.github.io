'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-24 border-b" style={{borderColor: '#171717'}}>
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="display text-5xl md:text-6xl text-white mb-6">
              Terms of Service
            </h1>
            <p className="body text-xl text-gray-300 max-w-2xl mx-auto">
              Please read these terms carefully before using TATU's services.
            </p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-invert max-w-none">
              <div className="space-y-8">
                <div>
                  <h2 className="display text-3xl text-white mb-4">1. Acceptance of Terms</h2>
                  <p className="body text-gray-300">
                    By accessing and using TATU's platform, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">2. Description of Service</h2>
                  <p className="body text-gray-300">
                    TATU provides a marketplace platform connecting tattoo artists with clients. Our services include portfolio hosting, appointment booking, payment processing, and communication tools.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">3. User Accounts</h2>
                  <p className="body text-gray-300">
                    You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">4. Artist Verification</h2>
                  <p className="body text-gray-300">
                    Artists must undergo a verification process to ensure quality and safety standards. TATU reserves the right to verify credentials and may remove artists who fail to meet our standards.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">5. Payment Terms</h2>
                  <p className="body text-gray-300">
                    All payments are processed securely through our payment partners. TATU charges a service fee on transactions. Refunds are subject to our refund policy and individual artist policies.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">6. Content and Intellectual Property</h2>
                  <p className="body text-gray-300">
                    Users retain ownership of their content. By posting content on TATU, you grant us a license to display and distribute that content as part of our service.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">7. Prohibited Activities</h2>
                  <p className="body text-gray-300">
                    Users may not engage in illegal activities, harassment, fraud, or any behavior that violates our community guidelines. Violations may result in account termination.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">8. Limitation of Liability</h2>
                  <p className="body text-gray-300">
                    TATU is not liable for any damages arising from the use of our service, including but not limited to direct, indirect, incidental, or consequential damages.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">9. Privacy Policy</h2>
                  <p className="body text-gray-300">
                    Your privacy is important to us. Please review our <Link href="/privacy" className="text-white hover:text-gray-300 underline">Privacy Policy</Link>, which also governs your use of the service.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">10. Changes to Terms</h2>
                  <p className="body text-gray-300">
                    TATU reserves the right to modify these terms at any time. We will notify users of significant changes via email or through our platform.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">11. Contact Information</h2>
                  <p className="body text-gray-300">
                    If you have any questions about these Terms of Service, please contact us at <Link href="/contact" className="text-white hover:text-gray-300 underline">support@tatu.com</Link>.
                  </p>
                </div>

                <div className="bg-surface p-6 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong>Last updated:</strong> January 2025<br />
                    These terms are effective as of the date above and will remain in effect except with respect to any changes in their provisions in the future.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-surface">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="display text-4xl text-white mb-6">
              Questions about our terms?
            </h2>
            <p className="body text-xl text-gray-300 mb-8">
              Our team is here to help clarify any questions you may have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn btn-primary">
                Contact Support
              </Link>
              <Link href="/help" className="btn btn-ghost">
                Visit Help Center
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 