import React from "react";

const Privacy: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold">PRIVACY POLICY</h1>
      <p className="text-sm text-gray-500">Effective Date: 6th April 2025</p>
      
      <div className="space-y-4">
        <p className="text-gray-700">
          Welcome to Game of Docs: Legal Automation Quest. At Lawyal Tech ("we," "us," or "our"),
          we value your privacy and are committed to protecting your personal data. This Privacy
          Policy describes how we collect, use, and disclose your personal information when you use
          Game of Docs: Legal Automation Quest (the "Game"), and your choices and rights with
          respect to your data, in compliance with the General Data Protection Regulation (GDPR)
          and the California Consumer Privacy Act (CCPA).
        </p>
        <p className="text-gray-700">
          By using the Game, you acknowledge that you have read and understood this Privacy
          Policy.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">1. PERSONAL DATA WE COLLECT</h2>
        <p className="text-gray-700">We may collect and process the following types of personal data:</p>
        
        <div className="ml-4">
          <h3 className="text-lg font-semibold">A. Information You Provide to Us</h3>
          <ul className="list-disc list-inside ml-4 text-gray-700">
            <li>Contact Details: Name, email address, phone number and professional background.</li>
            <li>Account Information: Username, age, profile picture, location and other registration details.</li>
            <li>Payment Information: If applicable, we collect billing details for premium features, but payments are processed through third-party providers.</li>
            <li>Communications: Feedback, customer support inquiries, and survey responses.</li>
          </ul>
          
          <h3 className="text-lg font-semibold mt-4">B. Information We Collect Automatically</h3>
          <ul className="list-disc list-inside ml-4 text-gray-700">
            <li>Usage Data: Pages visited, time spent, features used, and in-game interactions.</li>
            <li>Device and Technical Data: IP address, browser type, operating system, and device identifiers.</li>
            <li>Cookies and Tracking Technologies: We use cookies and similar technologies to enhance your experience (see Section 6: Cookies and Tracking Technologies).</li>
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">2. HOW WE USE YOUR DATA</h2>
        <p className="text-gray-700">
          We may process your personal information according to the following legal bases: to provide
          products or services you request, to promote Lawyal Tech's legitimate interests, to comply
          with legal obligations, and with your consent. In particular, we use your data for the following
          purposes:
        </p>
        <ul className="list-disc list-inside ml-4 text-gray-700">
          <li>To provide, maintain, and improve the Game.</li>
          <li>To create and manage your account.</li>
          <li>To personalize your learning experience and track progress.</li>
          <li>To communicate with you regarding updates, offers, and support.</li>
          <li>To comply with legal and regulatory obligations.</li>
          <li>To analyze usage trends and improve platform performance.</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">3. HOW WE SHARE YOUR DATA</h2>
        <p className="text-gray-700">We do not sell personal data. However, we may share data with:</p>
        <ul className="list-disc list-inside ml-4 text-gray-700">
          <li>Service Providers: Cloud storage, analytics, and customer support providers.</li>
          <li>Legal and Compliance Authorities: When required by law or to protect legal rights.</li>
          <li>Business Transfers: In case of a merger, acquisition, or asset sale, your data may be transferred.</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">4. YOUR DATA RIGHTS</h2>
        <p className="text-gray-700">
          You have the following rights in relation to the personal information we hold about you, in
          addition to any other rights required by applicable law:
        </p>
        <ul className="list-disc list-inside ml-4 text-gray-700">
          <li>Know what personal data we collect, use, and share.</li>
          <li>Access your data.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data.</li>
          <li>Restrict or object to data processing.</li>
          <li>Request data portability.</li>
          <li>Withdraw consent at any time (where processing is based on consent).</li>
          <li>Lodge a complaint with a data protection authority.</li>
        </ul>
        <p className="text-gray-700">
          Please note that the above rights may be subject to exceptions and limitations. We may
          refuse requests to exercise data subject rights if there is a legitimate reason, such as if we
          cannot authenticate your identity, if the request could violate the rights of a third party or
          applicable law, or if the request could interfere with a Lawyal Tech service or prevent us from
          delivering a service you requested.
        </p>
        <p className="text-gray-700">
          To exercise these rights, contact us at reach@lawyaltech.org.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">5. DATA RETENTION & SECURITY</h2>
        <ul className="list-disc list-inside ml-4 text-gray-700">
          <li>We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by applicable law or regulatory obligations.</li>
          <li>We implement technical and organizational security measures designed to protect your personal data against unauthorized access, loss, destruction, alteration, or disclosure.</li>
          <li>While we take these security measures seriously, no system can guarantee absolute security. If you suspect unauthorized access or misuse of your personal data, please contact us immediately at reach@lawyaltech.org.</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">6. COOKIES AND TRACKING TECHNOLOGIES</h2>
        <p className="text-gray-700">We use cookies and similar technologies to:</p>
        <ul className="list-disc list-inside ml-4 text-gray-700">
          <li>Remember your preferences.</li>
          <li>Analyze platform usage.</li>
          <li>Improve functionality and user experience.</li>
        </ul>
        <p className="text-gray-700">You can manage cookie preferences via your browser settings.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">7. INTERNATIONAL DATA TRANSFERS</h2>
        <p className="text-gray-700">
          We collect information globally and may transfer, process and store your information outside
          of your country of residence, to wherever we or our third-party service providers operate for
          the purpose of providing you the Services. Whenever we transfer your information, we take
          steps, including preventive measures, designed to protect your Personal Information.
        </p>
        <p className="text-gray-700">
          Where required, we will use appropriate safeguards for transferring data outside of the EEA,
          Switzerland, and the UK. This includes signing Standard Contractual Clauses that govern
          the transfers of such data, which may be used in conjunction with additional safeguards.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">8. CHANGES TO THIS PRIVACY POLICY</h2>
        <p className="text-gray-700">
          We may update this Privacy Policy from time to time. Any changes will be posted with a
          revised "Last Updated" date. If changes are significant, we will notify you via email or
          through the Game.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">9. CONTACT US</h2>
        <p className="text-gray-700">If you have any questions about this Privacy Policy, you can contact us at:</p>
        <div className="ml-4 text-gray-700">
          <p>Lawyal Tech</p>
          <p>River Bank Colony, Lucknow, Uttar Pradesh, India. 226018</p>
          <p>Email: reach@lawyaltech.org</p>
          <p>Phone: +91 7985144630 / + 46 764428529</p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;