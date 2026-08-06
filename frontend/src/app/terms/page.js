export const metadata = {
  title: 'Terms of Service | Snipr AI',
  description: 'Terms of Service for Snipr AI — the free AI video clipping tool. Read our usage terms, content policy, and disclaimers.',
};

export default function TermsPage() {
  return (
    <div className="fade-in" style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '0.35rem 1rem', fontSize: '0.78rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.06em' }}>
          LEGAL
        </div>
        <h1 style={{ fontSize: '2.75rem', color: '#ffffff', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          Terms of Service
        </h1>
        <p style={{ color: '#71717a', fontSize: '1rem' }}>Last updated: August 6, 2026</p>
      </header>

      <div className="article-content" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '2.75rem', lineHeight: 1.8, fontSize: '1.05rem', color: '#d4d4d8' }}>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using Snipr AI ("the Service") at sniprai.vercel.app, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>

        <h2>2. Description of Service</h2>
        <p>Snipr AI is a free online tool that allows users to upload video files and generate short-form clips optimized for social media platforms including TikTok, Instagram Reels, and YouTube Shorts. The Service is provided free of charge with no account registration required.</p>

        <h2>3. User Responsibilities</h2>
        <p>By using Snipr AI, you agree that:</p>
        <ul>
          <li>You own or have obtained all necessary permissions, licenses, and rights to upload, process, and extract clips from any video content you submit to the Service.</li>
          <li>You will not upload content that is illegal, defamatory, obscene, threatening, or violates any third-party intellectual property or copyright rights.</li>
          <li>You will not attempt to circumvent, disable, or interfere with the security features of the Service.</li>
          <li>You will not use the Service for any automated bulk processing without prior written permission.</li>
          <li>You are solely responsible for ensuring your use of generated clips complies with copyright laws and the terms of service of any platform (TikTok, YouTube, Instagram, X, etc.) where you post them.</li>
        </ul>

        <h2>4. Copyright Disclaimer & Sole User Liability</h2>
        <p><strong>Copyright Responsibility Lies Entirely with the User:</strong> Snipr AI acts solely as a technical automated utility and video processing service. We do not claim ownership of, review, monitor, or endorse any user-uploaded content or generated clips.</p>
        <p>By uploading any video to Snipr AI, you explicitly acknowledge and warrant that:</p>
        <ul>
          <li>You are 100% legally responsible for any copyright claims, DMCA takedown notices, trademark disputes, or legal liabilities arising from the video content you upload or the clips you generate and distribute.</li>
          <li>Snipr AI, its owners, developers, and hosting providers assume <strong>zero liability</strong> for any copyright violations, strikes, or legal action resulting from user-generated clips or uploaded content.</li>
          <li>You agree to fully indemnify, defend, and hold harmless Snipr AI and its operators against any claims, losses, damages, liabilities, and legal expenses (including attorney fees) resulting from your violation of third-party copyright or intellectual property rights.</li>
        </ul>

        <h2>5. Intellectual Property</h2>
        <p>You retain full ownership of any video content you upload to Snipr AI and any clips generated from your content, provided you possess the original rights. Snipr AI does not claim any ownership rights over your content. The Snipr AI name, logo, and underlying application code are the intellectual property of the Snipr AI team.</p>

        <h2>6. Content Policy</h2>
        <p>The following types of content are strictly prohibited on Snipr AI:</p>
        <ul>
          <li>Content that depicts or promotes illegal activities</li>
          <li>Sexually explicit or pornographic material</li>
          <li>Content that harasses, threatens, or demeans individuals</li>
          <li>Content protected by copyright that you do not have permission or legal license to use (e.g., commercial movies, TV shows, music videos)</li>
          <li>Deepfakes or synthetic media designed to deceive</li>
        </ul>
        <p>We reserve the right to terminate access or block processing for any user who violates this content policy.</p>

        <h2>6. Service Availability</h2>
        <p>Snipr AI is provided on an "as is" and "as available" basis. We do not guarantee continuous, uninterrupted access to the Service. Our processing servers may experience downtime for maintenance or due to high demand. We are not liable for any losses caused by Service unavailability.</p>

        <h2>7. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Snipr AI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of data, loss of revenue, or business interruption. Our total liability to you for any claim arising from these Terms shall not exceed the amount you paid us in the past 12 months (which, given our free service, is zero).</p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>The Service is provided without warranties of any kind, express or implied. We do not warrant that the Service will be error-free, that generated clips will meet your specific requirements, or that the Service will be compatible with all devices and browsers.</p>

        <h2>9. Modifications to Service and Terms</h2>
        <p>We reserve the right to modify or discontinue the Service at any time without notice. We may also update these Terms of Service. Continued use of the Service after changes constitutes acceptance of the modified terms.</p>

        <h2>10. Governing Law</h2>
        <p>These Terms of Service shall be governed by and construed in accordance with applicable laws. Any disputes arising from these terms shall be resolved through good-faith negotiation before any formal legal proceedings.</p>

        <h2>11. Contact</h2>
        <p>For questions about these Terms of Service, please visit our <a href="/contact">Contact page</a>.</p>
      </div>
    </div>
  );
}
