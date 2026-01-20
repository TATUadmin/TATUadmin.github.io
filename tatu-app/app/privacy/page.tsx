'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-24 border-b" style={{borderColor: '#171717'}}>
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="display text-5xl md:text-6xl text-white mb-6">
              Privacy Policy
            </h1>
            <p className="body text-xl text-gray-300 max-w-2xl mx-auto">
              Learn how TATU collects, uses, and protects your personal information.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-invert max-w-none">
              <div className="space-y-8">
                <div>
                  <h2 className="display text-3xl text-white mb-4">1. Information We Collect</h2>
                  <p className="body text-gray-300">
                    We collect information you provide directly to us, such as when you create an account, book appointments, or contact our support team. This may include your name, email address, phone number, and payment information.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">2. How We Use Your Information</h2>
                  <p className="body text-gray-300">
                    We use the information we collect to provide, maintain, and improve our services, process transactions, send you technical notices and support messages, and respond to your comments and questions.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">3. Information Sharing</h2>
                  <p className="body text-gray-300">
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy. We may share information with service providers who assist us in operating our platform.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">4. Data Security</h2>
                  <p className="body text-gray-300">
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">5. Cookies and Tracking</h2>
                  <p className="body text-gray-300">
                    We use cookies and similar tracking technologies to enhance your experience on our platform. You can control cookie settings through your browser preferences.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">6. Third-Party Services</h2>
                  <p className="body text-gray-300">
                    Our platform may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties and encourage you to review their privacy policies.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">7. Data Retention</h2>
                  <p className="body text-gray-300">
                    We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your account and associated data at any time.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">8. Your Rights</h2>
                  <p className="body text-gray-300">
                    You have the right to access, update, or delete your personal information. You may also opt out of certain communications and request data portability. Contact us to exercise these rights.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">9. Children's Privacy</h2>
                  <p className="body text-gray-300">
                    Our services are not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you believe we have collected such information, please contact us.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">10. International Transfers</h2>
                  <p className="body text-gray-300">
                    Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this policy.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">11. Changes to This Policy</h2>
                  <p className="body text-gray-300">
                    We may update this privacy policy from time to time. We will notify you of any material changes by posting the new policy on our platform and updating the "Last Updated" date.
                  </p>
                </div>

                <div>
                  <h2 className="display text-3xl text-white mb-4">12. Contact Us</h2>
                  <p className="body text-gray-300">
                    If you have any questions about this privacy policy or our data practices, please contact us at <Link href="/contact" className="text-white hover:text-gray-300 underline">support@tatu.com</Link>.
                  </p>
                </div>

                <div className="bg-surface p-6 rounded-lg">
                  <p className="text-gray-300 text-sm">
                    <strong>Last updated:</strong> January 20, 2026<br />
                    <strong>Version:</strong> 1.1<br />
                    This privacy policy is effective as of the date above and will remain in effect except with respect to any changes in its provisions in the future.
                  </p>
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-gray-300 text-sm mb-2">
                      <strong>Note:</strong> This is a summary. Please review our comprehensive Privacy Policy for complete details on data handling.
                    </p>
                    <a 
                      href="/PRIVACY_POLICY.md" 
                      target="_blank"
                      className="inline-block px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition text-sm font-medium"
                    >
                      View Full Privacy Policy →
                    </a>
                  </div>
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
              Have privacy concerns?
            </h2>
            <p className="body text-xl text-gray-300 mb-8">
              Our team is committed to protecting your privacy and is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn btn-primary">
                Contact Us
              </Link>
              <Link href="/help" className="btn btn-ghost">
                Get Help
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 