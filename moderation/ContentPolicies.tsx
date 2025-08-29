import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  Scale, 
  Eye, 
  Ban,
  Clock,
  Mail,
  ExternalLink
} from "lucide-react";

export function ContentPolicies() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Shield className="w-8 h-8" />
          Community Guidelines & Policies
        </h1>
        <p className="text-muted-foreground">
          Our commitment to maintaining a safe and welcoming community for everyone
        </p>
      </div>

      <Tabs defaultValue="guidelines" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="guidelines">Community Guidelines</TabsTrigger>
          <TabsTrigger value="terms">Terms of Service</TabsTrigger>
          <TabsTrigger value="dmca">DMCA Policy</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        <TabsContent value="guidelines">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Community Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-green-600" />
                        What We Allow
                      </h3>
                      <ul className="space-y-2 text-sm">
                        <li>• Respectful and constructive discussions</li>
                        <li>• Sharing original content and creative work</li>
                        <li>• Educational and informative posts</li>
                        <li>• Community-building activities</li>
                        <li>• Constructive feedback and criticism</li>
                        <li>• Reporting content that violates our policies</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Ban className="w-4 h-4 text-red-600" />
                        Prohibited Content
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Badge variant="destructive" className="mb-2">Violence & Harm</Badge>
                          <ul className="space-y-1 text-sm">
                            <li>• Threats of violence or harm</li>
                            <li>• Content promoting self-harm</li>
                            <li>• Graphic violence or gore</li>
                            <li>• Instructions for dangerous activities</li>
                          </ul>
                        </div>

                        <div>
                          <Badge variant="destructive" className="mb-2">Harassment & Bullying</Badge>
                          <ul className="space-y-1 text-sm">
                            <li>• Personal attacks or insults</li>
                            <li>• Doxxing or sharing private information</li>
                            <li>• Targeted harassment campaigns</li>
                            <li>• Impersonation of others</li>
                          </ul>
                        </div>

                        <div>
                          <Badge variant="destructive" className="mb-2">Hate Speech</Badge>
                          <ul className="space-y-1 text-sm">
                            <li>• Content targeting race, religion, gender, or sexual orientation</li>
                            <li>• Discriminatory language or slurs</li>
                            <li>• Content promoting hate groups</li>
                            <li>• Symbols or imagery associated with hate</li>
                          </ul>
                        </div>

                        <div>
                          <Badge variant="destructive" className="mb-2">Adult Content</Badge>
                          <ul className="space-y-1 text-sm">
                            <li>• Nudity or sexually explicit content</li>
                            <li>• Sexual solicitation</li>
                            <li>• Content involving minors in sexual contexts</li>
                            <li>• Non-consensual intimate imagery</li>
                          </ul>
                        </div>

                        <div>
                          <Badge variant="destructive" className="mb-2">Spam & Misinformation</Badge>
                          <ul className="space-y-1 text-sm">
                            <li>• Repetitive or promotional content</li>
                            <li>• Fake accounts or automated posting</li>
                            <li>• Deliberately false information</li>
                            <li>• Phishing or scam attempts</li>
                          </ul>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-orange-600" />
                        Enforcement Actions
                      </h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                          <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Warning</h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            First-time minor violations may result in a warning and content removal.
                          </p>
                        </div>
                        <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                          <h4 className="font-medium text-orange-800 dark:text-orange-200">Temporary Suspension</h4>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Repeat violations or moderate violations result in temporary account restrictions.
                          </p>
                        </div>
                        <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                          <h4 className="font-medium text-red-800 dark:text-red-200">Permanent Ban</h4>
                          <p className="text-sm text-red-700 dark:text-red-300">
                            Severe violations or repeated offenses result in permanent account termination.
                          </p>
                        </div>
                      </div>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="terms">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Terms of Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-6 text-sm">
                  <section>
                    <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                    <p>
                      By accessing and using this social media platform, you accept and agree to be bound by the terms and provision of this agreement.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">2. User Accounts</h3>
                    <ul className="space-y-1">
                      <li>• You must be at least 13 years old to create an account</li>
                      <li>• You are responsible for maintaining account security</li>
                      <li>• One person may not maintain multiple accounts</li>
                      <li>• Accounts are non-transferable</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">3. Content Ownership and Rights</h3>
                    <ul className="space-y-1">
                      <li>• You retain ownership of content you create and share</li>
                      <li>• You grant us a license to display and distribute your content</li>
                      <li>• You are responsible for ensuring you have rights to shared content</li>
                      <li>• We may remove content that violates our policies</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">4. Privacy and Data</h3>
                    <ul className="space-y-1">
                      <li>• We collect and use data as described in our Privacy Policy</li>
                      <li>• You control your privacy settings</li>
                      <li>• We implement security measures to protect your data</li>
                      <li>• Data retention policies apply to deleted content</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">5. Prohibited Uses</h3>
                    <ul className="space-y-1">
                      <li>• Violating laws or regulations</li>
                      <li>• Infringing on intellectual property rights</li>
                      <li>• Harassing or threatening other users</li>
                      <li>• Attempting to hack or compromise the platform</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">6. Limitation of Liability</h3>
                    <p>
                      The platform is provided "as is" without warranties. We are not liable for any damages arising from use of the service.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">7. Changes to Terms</h3>
                    <p>
                      We reserve the right to modify these terms at any time. Continued use constitutes acceptance of updated terms.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">8. Contact Information</h3>
                    <p>
                      Questions about these terms should be directed to: legal@socialapp.com
                    </p>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dmca">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                DMCA Copyright Policy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-6 text-sm">
                  <section>
                    <h3 className="text-lg font-semibold mb-3">Digital Millennium Copyright Act (DMCA) Policy</h3>
                    <p>
                      We respect the intellectual property rights of others and expect our users to do the same. 
                      This policy outlines our procedures for handling copyright infringement claims.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">Reporting Copyright Infringement</h3>
                    <p className="mb-3">
                      If you believe your copyrighted work has been infringed, please provide the following information:
                    </p>
                    <ul className="space-y-1">
                      <li>• Identification of the copyrighted work claimed to be infringed</li>
                      <li>• Identification of the infringing material and its location</li>
                      <li>• Your contact information (address, phone, email)</li>
                      <li>• A statement of good faith belief that use is not authorized</li>
                      <li>• A statement of accuracy and authority to act on behalf of copyright owner</li>
                      <li>• Your physical or electronic signature</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">DMCA Contact Information</h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <p><strong>Copyright Agent:</strong> Legal Department</p>
                      <p><strong>Email:</strong> dmca@socialapp.com</p>
                      <p><strong>Address:</strong> 123 Tech Street, San Francisco, CA 94105</p>
                      <p><strong>Phone:</strong> (555) 123-4567</p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">Counter-Notice Procedure</h3>
                    <p className="mb-3">
                      If you believe your content was wrongly removed, you may file a counter-notice including:
                    </p>
                    <ul className="space-y-1">
                      <li>• Identification of the removed material and its former location</li>
                      <li>• Your contact information</li>
                      <li>• Statement of good faith belief that removal was a mistake</li>
                      <li>• Consent to jurisdiction of federal court</li>
                      <li>• Your physical or electronic signature</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">Repeat Infringer Policy</h3>
                    <p>
                      We will terminate accounts of users who are determined to be repeat infringers of copyright.
                    </p>
                  </section>

                  <section>
                    <h3 className="text-lg font-semibold mb-3">Response Timeline</h3>
                    <ul className="space-y-1">
                      <li>• DMCA notices: We respond within 24-48 hours</li>
                      <li>• Content removal: Typically within 24 hours of valid notice</li>
                      <li>• Counter-notices: We respond within 10 business days</li>
                      <li>• Restoration: 10-14 business days if no legal action is filed</li>
                    </ul>
                  </section>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reporting">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                How to Report Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">Reporting Process</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <h4 className="font-medium">1. Identify</h4>
                      <p className="text-sm text-muted-foreground">
                        Find content that violates our guidelines
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                      <h4 className="font-medium">2. Report</h4>
                      <p className="text-sm text-muted-foreground">
                        Use the report button and select appropriate reason
                      </p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <h4 className="font-medium">3. Review</h4>
                      <p className="text-sm text-muted-foreground">
                        Our team reviews and takes appropriate action
                      </p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">What to Report</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Badge variant="destructive" className="mb-2">High Priority</Badge>
                      <ul className="space-y-1 text-sm">
                        <li>• Violence or threats</li>
                        <li>• Harassment or bullying</li>
                        <li>• Hate speech</li>
                        <li>• Self-harm content</li>
                        <li>• Adult or sexual content</li>
                      </ul>
                    </div>
                    <div>
                      <Badge variant="secondary" className="mb-2">Standard Priority</Badge>
                      <ul className="space-y-1 text-sm">
                        <li>• Spam or unwanted content</li>
                        <li>• Copyright violations</li>
                        <li>• Misinformation</li>
                        <li>• Privacy violations</li>
                        <li>• Impersonation</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Response Times</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 bg-red-50 dark:bg-red-950 rounded">
                      <span className="font-medium text-red-800 dark:text-red-200">Critical (Violence, Harm)</span>
                      <span className="text-red-600 dark:text-red-400">Within 1 hour</span>
                    </div>
                    <div className="flex justify-between p-2 bg-orange-50 dark:bg-orange-950 rounded">
                      <span className="font-medium text-orange-800 dark:text-orange-200">High Priority</span>
                      <span className="text-orange-600 dark:text-orange-400">Within 24 hours</span>
                    </div>
                    <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-950 rounded">
                      <span className="font-medium text-blue-800 dark:text-blue-200">Standard Priority</span>
                      <span className="text-blue-600 dark:text-blue-400">Within 3 days</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-3">Emergency Contact</h3>
                  <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-red-800 dark:text-red-200">
                        Immediate Threats or Emergencies
                      </span>
                    </div>
                    <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                      For content involving immediate threats to safety or illegal activity:
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>emergency@socialapp.com</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ExternalLink className="w-4 h-4" />
                        <span>Call local emergency services</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}