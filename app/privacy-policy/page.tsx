import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Aegyo Arena',
  description:
    'Aegyo Arena privacy policy — how we collect, use, and protect your personal information.',
};

const h2: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 800,
  color: '#111',
  margin: '32px 0 10px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const h3: React.CSSProperties = {
  fontSize: '0.9rem',
  fontWeight: 700,
  color: '#333',
  margin: '20px 0 8px',
};

const p: React.CSSProperties = {
  margin: '0 0 14px',
  lineHeight: 1.75,
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 100px' }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/" style={{ fontSize: '0.82rem', color: '#7B2FBE', textDecoration: 'none', fontWeight: 600 }}>
          ← Aegyo Arena
        </Link>
      </div>

      <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 900, color: '#111', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
        Privacy Policy
      </h1>
      <p style={{ fontSize: '0.85rem', color: '#888', margin: '0 0 6px' }}>
        <strong>https://www.aegyoarena.com</strong>
      </p>
      <p style={{ fontSize: '0.85rem', color: '#888', margin: '0 0 40px' }}>
        Effective Date: June 5, 2026
      </p>

      <div style={{ fontSize: '0.93rem', color: '#222' }}>
        <p style={p}>
          This Privacy Policy describes how Aegyo Arena (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or
          &ldquo;our&rdquo;) collects, uses, and shares information about you when you visit, use,
          or otherwise interact with the website located at AegyoArena.com and any related services,
          features, content, or applications offered by us (collectively, the
          &ldquo;Service&rdquo;).
        </p>
        <p style={p}>
          By accessing or using the Service, you agree to the practices described in this Privacy
          Policy. If you do not agree with this Privacy Policy, please do not use the Service.
        </p>

        <h2 style={h2}>1. Information We Collect</h2>
        <p style={p}>
          We collect information about you in several ways when you use the Service. The categories
          of information we may collect are described below.
        </p>

        <h3 style={h3}>a. Information You Provide to Us</h3>
        <p style={p}>
          If the Service offers features that allow you to create an account, submit content (such
          as song annotations, comments, or corrections), contact us, or otherwise interact with us,
          we may collect information you choose to provide, which may include:
        </p>
        <ul style={{ paddingLeft: 24, margin: '0 0 14px', lineHeight: 1.75 }}>
          <li style={{ marginBottom: 8 }}>
            Account or profile information, such as a username, display name, email address, and
            password (if account features are enabled);
          </li>
          <li style={{ marginBottom: 8 }}>
            Content you submit, post, or upload through the Service, including text, comments,
            annotations, suggested edits, or other user-generated content;
          </li>
          <li style={{ marginBottom: 8 }}>
            Communications you send to us, including the contents of email messages, support
            requests, or other correspondence.
          </li>
        </ul>

        <h3 style={h3}>b. Information We Collect Automatically</h3>
        <p style={p}>
          When you visit or interact with the Service, we (and our service providers) automatically
          collect certain information about your device and your use of the Service, including:
        </p>
        <ul style={{ paddingLeft: 24, margin: '0 0 14px', lineHeight: 1.75 }}>
          <li style={{ marginBottom: 8 }}>
            Log and device information, such as your Internet Protocol (IP) address, browser type
            and version, operating system, device identifiers, language preference, referring and
            exit pages, and the date and time of your requests;
          </li>
          <li style={{ marginBottom: 8 }}>
            Usage information, such as the pages and content you view, the artists and songs you
            search for or access, the links you click, the time spent on pages, and other usage
            statistics;
          </li>
          <li style={{ marginBottom: 8 }}>
            Cookies, web beacons, local storage, and similar tracking technologies, as described in
            Section 4 below;
          </li>
          <li style={{ marginBottom: 8 }}>
            Approximate location information derived from your IP address (for example, country,
            region, or city).
          </li>
        </ul>

        <h3 style={h3}>c. Information From Third Parties</h3>
        <p style={p}>
          We may receive information about you from third-party sources, including:
        </p>
        <ul style={{ paddingLeft: 24, margin: '0 0 14px', lineHeight: 1.75 }}>
          <li style={{ marginBottom: 8 }}>
            Third-party data and content providers (such as lyrics, song metadata, or artist
            information providers, including, where applicable, the Genius API), which supply
            content displayed on the Service;
          </li>
          <li style={{ marginBottom: 8 }}>
            Analytics providers and other service providers that help us understand how the Service
            is used;
          </li>
          <li style={{ marginBottom: 8 }}>Public sources, where permitted by applicable law.</li>
        </ul>
        <p style={p}>
          We do not control, and are not responsible for, the privacy practices of any third-party
          source from which we receive information. You should review the privacy notices of any
          third party that you interact with.
        </p>

        <h2 style={h2}>2. How We Use Information</h2>
        <p style={p}>We use the information we collect for purposes including:</p>
        <ul style={{ paddingLeft: 24, margin: '0 0 14px', lineHeight: 1.75 }}>
          {[
            'Operating, maintaining, securing, and improving the Service;',
            'Providing the content and features that you request, including displaying lyrics, song information, and search results;',
            'Personalizing your experience, such as remembering your preferences and recent searches;',
            'Communicating with you, including responding to inquiries, sending administrative messages, and providing information about features or updates;',
            'Analyzing usage patterns and trends, conducting research, and generating aggregated or de-identified statistics;',
            'Detecting, investigating, and preventing fraud, abuse, security incidents, and other harmful, unauthorized, or illegal activity;',
            'Complying with applicable laws, regulations, legal processes, and enforcing our Terms of Service or other agreements;',
            'Any other purpose for which we obtain your consent.',
          ].map((item, i) => (
            <li key={i} style={{ marginBottom: 8 }}>{item}</li>
          ))}
        </ul>

        <h2 style={h2}>3. Legal Bases for Processing (EEA, UK, and Similar Jurisdictions)</h2>
        <p style={p}>
          If you are located in the European Economic Area, the United Kingdom, or another
          jurisdiction that requires a legal basis for processing personal data, we rely on one or
          more of the following legal bases:
        </p>
        <ul style={{ paddingLeft: 24, margin: '0 0 14px', lineHeight: 1.75 }}>
          <li style={{ marginBottom: 8 }}>
            <strong>Performance of a contract</strong> &mdash; to provide the Service to you and
            fulfill our obligations to you;
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Legitimate interests</strong> &mdash; such as operating, securing, and
            improving the Service, preventing fraud and abuse, and understanding how the Service is
            used, provided those interests are not overridden by your rights and interests;
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Consent</strong> &mdash; where you have given us consent, for example, for
            certain cookies or marketing communications (you may withdraw your consent at any time);
          </li>
          <li style={{ marginBottom: 8 }}>
            <strong>Compliance with legal obligations</strong> &mdash; where processing is
            necessary to comply with applicable law.
          </li>
        </ul>

        <h2 style={h2}>4. Cookies and Similar Technologies</h2>
        <p style={p}>
          We and our service providers use cookies, web beacons, local storage, and similar
          technologies to operate and personalize the Service, remember your preferences, analyze
          traffic and usage, and detect and prevent abuse.
        </p>
        <p style={p}>
          Most web browsers allow you to control cookies through their settings, including the
          ability to refuse or delete cookies. If you choose to block or delete cookies, some
          features of the Service may not function properly.
        </p>
        <p style={p}>
          Depending on your jurisdiction, you may also be presented with a cookie banner or
          preference center allowing you to manage non-essential cookies.
        </p>

        <h2 style={h2}>5. How We Share Information</h2>
        <p style={p}>
          We do not sell your personal information for monetary consideration. We may share
          information about you in the following circumstances:
        </p>
        <ul style={{ paddingLeft: 24, margin: '0 0 14px', lineHeight: 1.75 }}>
          <li style={{ marginBottom: 10 }}>
            <strong>Service providers.</strong> We share information with vendors, contractors, and
            service providers that perform services on our behalf, such as hosting (including our
            hosting provider Railway), analytics, content delivery, security, customer support, and
            email delivery. These providers are authorized to use your information only as necessary
            to provide services to us.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Third-party content and data providers.</strong> Where the Service integrates
            with or displays content from third parties (for example, lyrics, annotations, or song
            metadata from third-party APIs such as the Genius API), limited request information
            (such as IP address and request data) may be transmitted to those providers in
            connection with serving the requested content.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Legal and safety purposes.</strong> We may disclose information if we believe
            in good faith that disclosure is necessary to (i) comply with applicable law,
            regulation, subpoena, court order, or other legal process; (ii) protect the rights,
            property, or safety of us, our users, or others; (iii) detect, prevent, or address
            fraud, security, or technical issues; or (iv) enforce our Terms of Service or other
            agreements.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Business transfers.</strong> If we are involved in a merger, acquisition,
            financing, reorganization, bankruptcy, sale of assets, or similar transaction,
            information may be transferred as part of that transaction, subject to applicable law.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>With your consent.</strong> We may share information with third parties when
            you direct us to do so or otherwise consent to the sharing.
          </li>
          <li style={{ marginBottom: 10 }}>
            <strong>Aggregated or de-identified information.</strong> We may share aggregated,
            anonymized, or de-identified information that cannot reasonably be used to identify you
            for any purpose.
          </li>
        </ul>

        <h2 style={h2}>6. Third-Party Services and Links</h2>
        <p style={p}>
          The Service may contain links to third-party websites, services, or resources that are
          not operated or controlled by us, including third-party music platforms, video services,
          social media networks, or content sources. This Privacy Policy does not apply to those
          third-party services, and we are not responsible for their content, privacy practices, or
          terms. We encourage you to review the privacy notices of any third-party services you
          access.
        </p>

        <h2 style={h2}>7. Your Rights and Choices</h2>
        <p style={p}>
          Depending on where you live, you may have certain rights regarding your personal
          information. We will respond to verifiable requests as required by applicable law.
        </p>

        <h3 style={h3}>a. Rights Under European and UK Law</h3>
        <p style={p}>
          If you are located in the EEA, the UK, or another jurisdiction with similar laws, you may
          have the right to: (i) access and obtain a copy of your personal data; (ii) request
          rectification of inaccurate or incomplete data; (iii) request erasure of your data;
          (iv) restrict or object to certain processing; (v) request portability of certain data;
          and (vi) withdraw consent at any time where processing is based on consent. You also have
          the right to lodge a complaint with a supervisory authority in your jurisdiction.
        </p>

        <h3 style={h3}>b. Rights Under California Law (CCPA/CPRA)</h3>
        <p style={p}>
          If you are a California resident, you may have the right to: (i) know what categories and
          specific pieces of personal information we have collected, used, disclosed, and sold or
          shared; (ii) request deletion of personal information we have collected from you;
          (iii) request correction of inaccurate personal information; (iv) opt out of the
          &ldquo;sale&rdquo; or &ldquo;sharing&rdquo; of personal information (as those terms are
          defined under California law); (v) limit the use of sensitive personal information; and
          (vi) be free from unlawful discrimination for exercising your rights.
        </p>
        <p style={p}>
          We do not sell personal information for monetary consideration. To the extent any use of
          cookies or similar technologies on the Service constitutes &ldquo;sharing&rdquo; under the
          CCPA/CPRA, you may opt out by adjusting your cookie settings or using a recognized opt-out
          preference signal (such as Global Privacy Control), where available.
        </p>

        <h3 style={h3}>c. How to Exercise Your Rights</h3>
        <p style={p}>
          To exercise any of these rights, please contact us at{' '}
          <a href="mailto:hello@aegyoarena.com" style={{ color: '#7B2FBE' }}>
            hello@aegyoarena.com
          </a>
          . We may need to verify your identity before fulfilling your request. You may also
          authorize an agent to make a request on your behalf, subject to verification.
        </p>

        <h2 style={h2}>8. Children&apos;s Privacy</h2>
        <p style={p}>
          The Service is not directed to children under the age of 13 (or the equivalent minimum
          age in the relevant jurisdiction, such as 16 in parts of the European Economic Area). We
          do not knowingly collect personal information from children under that age. If you believe
          a child has provided us with personal information in violation of this Privacy Policy,
          please contact us at{' '}
          <a href="mailto:privacy@aegyoarena.com" style={{ color: '#7B2FBE' }}>
            privacy@aegyoarena.com
          </a>{' '}
          and we will take appropriate steps to delete the information.
        </p>

        <h2 style={h2}>9. Data Retention</h2>
        <p style={p}>
          We retain personal information for as long as reasonably necessary to fulfill the purposes
          described in this Privacy Policy, including to provide the Service, comply with our legal
          obligations, resolve disputes, and enforce our agreements. Retention periods may vary
          depending on the type of information and the context in which it was collected. When
          information is no longer needed, we will delete, anonymize, or de-identify it in
          accordance with our retention practices and applicable law.
        </p>

        <h2 style={h2}>10. Data Security</h2>
        <p style={p}>
          We use reasonable administrative, technical, and physical safeguards designed to protect
          personal information against unauthorized access, disclosure, alteration, and destruction.
          However, no method of transmission over the Internet or method of electronic storage is
          completely secure, and we cannot guarantee absolute security. You are responsible for
          maintaining the confidentiality of any account credentials you use to access the Service.
        </p>

        <h2 style={h2}>11. International Data Transfers</h2>
        <p style={p}>
          The Service is hosted in the United States, and information we collect may be transferred
          to, stored, and processed in the United States or other countries where we or our service
          providers operate. These countries may have data protection laws that differ from those in
          your country of residence. Where required by applicable law, we will implement appropriate
          safeguards (such as standard contractual clauses) for the transfer of personal
          information.
        </p>

        <h2 style={h2}>12. Third-Party Content; No Endorsement</h2>
        <p style={p}>
          Lyrics, annotations, song metadata, artist information, and similar content displayed on
          the Service may be sourced from third parties and are provided for informational and
          non-commercial reference purposes only. References to or integration with any third-party
          service, including the Genius API, do not constitute an endorsement by, partnership with,
          or affiliation between us and any such third party, unless expressly stated.
        </p>

        <h2 style={h2}>13. Do Not Track</h2>
        <p style={p}>
          Some browsers offer a &ldquo;Do Not Track&rdquo; (&ldquo;DNT&rdquo;) signal. Because no
          consistent industry standard for DNT has been adopted, the Service does not currently
          respond to DNT signals. We may revisit this position as standards evolve.
        </p>

        <h2 style={h2}>14. Changes to This Privacy Policy</h2>
        <p style={p}>
          We may update this Privacy Policy from time to time. When we make material changes, we
          will update the &ldquo;Effective Date&rdquo; above and, where appropriate, provide
          additional notice (such as a banner on the Service or, if you have an account, an email
          notification). Your continued use of the Service after the updated Privacy Policy takes
          effect constitutes your acceptance of the updated Privacy Policy.
        </p>

        <h2 style={h2}>15. Contact Us</h2>
        <p style={p}>
          If you have questions, comments, or concerns about this Privacy Policy or our privacy
          practices, please contact us at:
        </p>
        <div style={{ background: '#f8f8f8', border: '1px solid #e5e5e5', borderRadius: 8, padding: '18px 22px', margin: '0 0 14px' }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Aegyo Arena</div>
          <div>
            Email:{' '}
            <a href="mailto:privacy@aegyoarena.com" style={{ color: '#7B2FBE' }}>
              privacy@aegyoarena.com
            </a>
          </div>
          <div>
            Website:{' '}
            <a href="https://www.aegyoarena.com" style={{ color: '#7B2FBE' }}>
              https://www.aegyoarena.com
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
