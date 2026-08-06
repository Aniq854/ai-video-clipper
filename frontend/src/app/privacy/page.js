export const metadata = {
  title: 'Privacy Policy | Snipr AI',
  description: 'Snipr AI Privacy Policy — how we handle your uploaded videos, personal data, and usage information.',
};

export default function PrivacyPolicy() {
  return (
    <div className="fade-in" style={{ maxWidth: '820px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '9999px', padding: '0.35rem 1rem', fontSize: '0.78rem', color: '#a1a1aa', fontWeight: '700', marginBottom: '1rem', letterSpacing: '0.06em' }}>
          LEGAL
        </div>
        <h1 style={{ fontSize: '2.75rem', color: '#ffffff', fontWeight: '900', letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>
          Privacy Policy
        </h1>
        <p style={{ color: '#71717a', fontSize: '1rem' }}>Last updated: August 6, 2026</p>
      </header>

      <div className="article-content" style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', padding: '2.75rem', lineHeight: 1.8, fontSize: '1.05rem', color: '#d4d4d8' }}>

        <h2>1. Who We Are</h2>
        <p>Snipr AI ("we", "our", or "us") is an AI-powered video clipping tool available at <strong>sniprai.vercel.app</strong>. We help content creators transform long-form videos into short viral clips optimized for TikTok, YouTube Shorts, and Instagram Reels. This Privacy Policy explains how we collect, use, and protect your information when you use our service.</p>

        <h2>2. Information We Collect</h2>
        <p>We collect the minimum information necessary to provide the video clipping service:</p>
        <ul>
          <li><strong>Uploaded Video Files:</strong> When you upload an MP4, MOV, or other supported video file, it is temporarily stored on our processing servers to perform the clip extraction operation.</li>
          <li><strong>Usage Data:</strong> We collect anonymized usage data such as clip duration selected, aspect ratio chosen, and general processing metrics. This data does not include personally identifiable information.</li>
          <li><strong>Log Data:</strong> Like most web services, our servers automatically record standard log information including your browser type, operating system, IP address, and pages visited. This is used for security monitoring and debugging.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <p>We use the information we collect exclusively for:</p>
        <ul>
          <li>Processing your uploaded video and generating the requested clips</li>
          <li>Delivering the generated MP4 clip files to you via our Cloudflare R2 CDN</li>
          <li>Improving the performance and reliability of the Snipr AI service</li>
          <li>Monitoring for abuse, spam, and security threats</li>
        </ul>
        <p>We do <strong>not</strong> sell, rent, or share your data with third parties for marketing purposes.</p>

        <h2>4. Video File Storage and Retention</h2>
        <p>This is our most important data practice to understand:</p>
        <ul>
          <li><strong>Uploaded videos</strong> are temporarily stored in memory during processing only. They are <strong>not permanently stored</strong> on our servers after processing is complete.</li>
          <li><strong>Generated clip files</strong> are uploaded to Cloudflare R2 cloud storage and made available for download. These files are automatically deleted after 24 hours.</li>
          <li>We do not build a library of user-uploaded content. Your videos are not used to train machine learning models.</li>
        </ul>

        <h2>5. Cookies and Tracking</h2>
        <p>Snipr AI uses minimal cookies necessary for the service to function (such as session management). We do not use tracking cookies for advertising or behavioral profiling.</p>

        <h2>6. Third-Party Services</h2>
        <p>We use the following third-party services to operate Snipr AI:</p>
        <ul>
          <li><strong>Cloudflare R2:</strong> Cloud object storage for generated clip files. Cloudflare's privacy policy applies to data stored on their infrastructure.</li>
          <li><strong>Vercel:</strong> Hosting platform for our frontend application. Vercel's privacy policy governs their data practices.</li>
          <li><strong>Render.com:</strong> Backend server hosting for video processing. Render's privacy policy applies.</li>
        </ul>

        <h2>7. Children's Privacy</h2>
        <p>Snipr AI is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you believe a child has provided us with personal information, please contact us and we will delete it promptly.</p>

        <h2>8. Your Rights</h2>
        <p>Depending on your location, you may have the following rights regarding your data:</p>
        <ul>
          <li>The right to know what data we hold about you</li>
          <li>The right to request deletion of your data</li>
          <li>The right to opt out of any data processing</li>
        </ul>
        <p>To exercise any of these rights, contact us at the email address in our Contact page.</p>

        <h2>9. Security</h2>
        <p>We implement industry-standard security measures including HTTPS encryption for all data in transit, server-side access controls, and Cloudflare's security layer to protect our infrastructure from unauthorized access.</p>

        <h2>10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. Continued use of Snipr AI after any changes constitutes your acceptance of the updated policy.</p>

        <h2>11. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy or our data practices, please contact us through our <a href="/contact">Contact page</a>. We aim to respond to all privacy inquiries within 72 hours.</p>
      </div>
    </div>
  );
}
