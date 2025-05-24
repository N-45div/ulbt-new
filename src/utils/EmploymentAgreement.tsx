import React from "react";

// It is For Raw HTML string for Live_Generation
export const documentText = `
  <div id="document-preview" className="bg-white rounded-lg shadow-sm border border-black-100 p-8">
      <h1 className="text-blue-600 text-3xl font-bold mb-8 tracking-tight">
          EMPLOYMENT AGREEMENT
      </h1>
      <div className="text-blue-600 leading-relaxed space-y-6">
          <div>
              <h2 className="text-2xl font-bold mt-6">PARTIES</h2>
              <p>
                  <strong>Employer:</strong> <span className="placeholder-employer-name">[Employer Name]</span>, a company incorporated
                  and registered in <span className="placeholder-registered-address">Registered Address</span>, United Kingdom ("Company").
              <p>
                  <strong>Employee:</strong> <span className="placeholder-employee-name">Employee Name</span>, residing at <span className="placeholder-employee-address">Employee Address</span> ("Employee").
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">COMMENCEMENT OF EMPLOYMENT</h2>
              <p>
                  The Employee’s employment with the Company shall commence on
                  <span className="placeholder-employment-start-date">Employment Start Date</span>. The Employee's period of continuous employment will begin on this date. 
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">(PROBATIONARY PERIOD</h2><p>The first <span className="placeholder-probation-period-length">Probation Period Length</span> months of employment will be a probationary period. The Company shall assess the Employee’s performance and suitability during this time. Upon successful completion, the Employee will be confirmed in their role.) <span className="text-black font-bold">(Optional Clause)</span></p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">JOB TITLE AND DUTIES</h2>
              <p>
                  The Employee shall be employed as <span className="placeholder-job-title">Job Title</span> and shall report to
                  <span className="placeholder-reporting-manager">Reporting Manager</span>. The Employee's primary duties shall include <span className="placeholder-duties">Brief Description of Duties</span>. 
                  {The Employee may be required to perform additional duties as reasonably assigned by the Company.}
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">PLACE OF WORK</h2>
              <p>
                 The Employee’s normal place of work is <span className="placeholder-workplace-address">Workplace Address</span>.
              </p>
              <p>
                 {/The Employee may be required to work at other locations./}
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">WORKING HOURS</h2>
              <p>
                  The Employee’s normal working hours shall be <span className="placeholder-start-time">Start Time</span> to <span className="placeholder-end-time">End Time</span>, <span className="placeholder-days-of-work">Days of Work</span>. The Employee may be required to work additional hours as necessary to fulfill job responsibilities.
                  <p className="mt-5" id="employment-agreement-working-hours">
                      {The Employee is entitled to overtime pay for authorized overtime work}  {The Employee shall not receive additional payment for overtime worked}.
                  </p>
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">REMUNERATION</h2>
              <p>
                  The Employee shall receive a salary of <span className="placeholder-annual-salary">Annual Salary</span> [USD] per <span className="placeholder-payment-frequency">Payment Frequency</span>, payable in arrears on or before <span className="placeholder-payment-date">Payment Date</span> by direct bank transfer. The Company reserves the right to deduct any sums lawfully due, including overpayments or losses caused by the Employee’s actions.
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">HOLIDAY ENTITLEMENT</h2>
              <p>
                 The Employee shall be entitled to <span className="placeholder-holiday-entitlement">Holiday Entitlement</span> days of paid annual leave per year, including UK public holidays. Unused leave may not be carried forward without prior approval. 
                 {Upon termination, unused leave will be paid. For Unused Holiday Days unused days, the holiday pay is Holiday Pay [USD].}
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">SICKNESS ABSENCE</h2>
              <p>
                If the Employee is unable to work due to illness, they must notify the Company as soon as possible. Statutory Sick Pay (SSP) will be paid in accordance with current legislation. 
                {The Employee may also be entitled to Company sick pay.}
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">(PENSION</h2><p>The Employee will be enrolled in the Company’s workplace pension scheme in accordance with the Pensions Act 2008. Contributions will be made as required under auto-enrolment legislation.)</p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">TERMINATION CLAUSE</h2>
              <p>
                 Either party may terminate the employment by providing <span className="placeholder-notice-period">Notice Period</span> days written notice. The Company reserves the right to make a payment in lieu of notice.
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">CONFIDENTIALITY</h2>
              <p>
                  The Employee must not, during or after employment, disclose any confidential information belonging to the Company or its clients.

              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">DISCIPLINARY AND GRIEVANCE PROCEDURES</h2>
              <p>
                  The Employee is subject to the Company’s disciplinary and grievance procedures, details of which are available upon request.
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">GOVERNING LAW</h2>
              <p>
                 This Agreement shall be governed by and construed in accordance with the laws of England and Wales. Any disputes arising from this Agreement shall be subject to the exclusive jurisdiction of the courts of England and Wales.
              </p>
          </div>
          <div>
              <h2 className="text-2xl font-bold mt-6">SIGNED</h2>
              <p className="mb-3">
                  <strong>For and on behalf of the Company:</strong>
              </p>
              <p>Signature: ___________________________</p>
              <p>Name: <span className="placeholder-authorized-representative">Authorized Representative</span></p>
              <p>Title: <span className="placeholder-representative-title">Job Title of the authorized representative</span></p>
              <p className="mb-3">Date: <span className="placeholder-signature-date">Date of signature</span></p>
              <p className="mb-3">
                  <strong>Employee:</strong>
              </p>
              <p>Signature: ___________________________</p>
              <p>Name: <span className="placeholder-employee-name">Employee Name</span></p>
              <p>Date: <span className="placeholder-signing-date">Date of signing by Employee</span></p>
          </div>
      </div>
  </div>
`;

const EmploymentAgreement: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-black-100 p-8">
      <h1 className="text-blue-600 text-3xl font-bold mb-8 tracking-tight">
        EMPLOYMENT AGREEMENT
      </h1>
      <div className="text-blue-600 leading-relaxed">
        <h2 className="text-2xl font-bold">PARTIES</h2>
        <p id="employer-name-placeholder">
          <strong>Employer:</strong>{" "}
          <span className="placeholder-employer-name">[Employer Name]</span>, a company incorporated and registered in{" "}
          <span className="placeholder-registered-address">Registered Address</span>, United Kingdom ("Company").
        </p>
        <p>
          <strong>Employee:</strong>{" "}
          <span className="placeholder-employee-name">Employee Name</span>,
          residing at <span className="placeholder-employee-address">Employee Address</span>{" "}
          ("Employee").
        </p>

        <h2 className="text-2xl font-bold mt-6">COMMENCEMENT OF EMPLOYMENT</h2>
        <p>
          The Employee’s employment with the Company shall commence on{" "}
          <span className="placeholder-employment-start-date">Employment Start Date</span>. The
          Employee's period of continuous employment will begin on this date.
        </p> 

        <h2 className="text-2xl font-bold mt-6">(PROBATIONARY PERIOD</h2>
        <p>
          The first{" "}
          <span className="placeholder-probation-period-length">Probation Period Length</span> of
          employment will be a probationary period. The Company shall assess the
          Employee’s performance and suitability during this time. Upon
          successful completion, the Employee will be confirmed in their role.){" "}
          <span className="text-black font-bold">(Optional Clause)</span>      
        </p>

        <h2 className="text-2xl font-bold mt-6">JOB TITLE AND DUTIES</h2>
        <p>
          The Employee shall be employed as{" "}
          <span className="placeholder-job-title">Job Title</span> and shall
          report to <span className="placeholder-reporting-manager">Reporting Manager</span>. The
          Employee's primary duties shall include{" "}
          <span className="placeholder-duties">Brief Description of Duties</span>.{" "}
          {"{"}The Employee may be required to perform additional duties as
          reasonably assigned by the Company.{"}"}
        </p>

        <h2 className="text-2xl font-bold mt-6">PLACE OF WORK</h2>
        <p>
          The Employee’s normal place of work is{" "}
          <span className="placeholder-workplace-address">Workplace Address</span>.
        </p>
        <p>{"{"}/The Employee may be required to work at other locations./{"}"}</p>

        <h2 className="text-2xl font-bold mt-6">WORKING HOURS</h2>
        <p>
          The Employee’s normal working hours shall be{" "}
          <span className="placeholder-start-time">Start Time</span> to{" "}
          <span className="placeholder-end-time">End Time</span>,{" "}
          <span className="placeholder-days-of-work">Days of Work</span>. The Employee may be
          required to work additional hours as necessary to fulfill job
          responsibilities.
          <p className="mt-5">
            {"{"}The Employee is entitled to overtime pay for authorized overtime
            work{"}"}{" "}
            {"{"}The Employee shall not receive additional payment for overtime
            worked{"}"}.
          </p>
        </p>

        <h2 className="text-2xl font-bold mt-6">REMUNERATION</h2>
        <p>
          The Employee shall receive a salary of{" "}
          <span className="placeholder-annual-salary">Annual Salary</span> [USD] per{" "}
          <span className="placeholder-payment-frequency">Payment Frequency</span>, payable in
          arrears on or before <span className="placeholder-payment-date">Payment Date</span> by
          direct bank transfer. The Company reserves the right to deduct any sums lawfully due, including overpayments or losses caused by the Employee’s actions.
        </p>

        <h2 className="text-2xl font-bold mt-6">HOLIDAY ENTITLEMENT</h2>
        <p>
          The Employee shall be entitled to{" "}
          <span className="placeholder-holiday-entitlement">Holiday Entitlement</span> days of
          paid annual leave per year, including UK public holidays. Unused leave
          may not be carried forward without prior approval.{" "}
          {"{"}Upon termination, unused leave will be paid. For Unused Holiday
          Days unused days, the holiday pay is Holiday Pay [USD].{"}"}
        </p>

        <h2 className="text-2xl font-bold mt-6">SICKNESS ABSENCE</h2>
        <p>
          If the Employee is unable to work due to illness, they must notify the
          Company as soon as possible. Statutory Sick Pay (SSP) will be paid in
          accordance with current legislation.{" "}
          {"{"}The Employee may also be entitled to Company sick pay.{"}"}
        </p>

        <h2 className="text-2xl font-bold mt-6">(PENSION</h2>
        <p>
         The Employee will be enrolled in the Company’s workplace pension scheme in accordance with the Pensions Act 2008. Contributions will be made as required under auto-enrolment legislation.)
        </p>

        <h2 className="text-2xl font-bold mt-6">TERMINATION CLAUSE</h2>
        <p>
          Either party may terminate the employment by providing{" "}
          <span className="placeholder-notice-period">Notice Period</span> weeks written
          notice. The Company reserves the right to make a payment in lieu of notice.{" "}
          <span className="text-black font-bold">(Optional Clause)</span>
        </p>

        <h2 className="text-2xl font-bold mt-6">CONFIDENTIALITY</h2>
        <p>
          The Employee must not, during or after employment, disclose any confidential information belonging to the Company or its clients.

        </p>

        <h2 className="text-2xl font-bold mt-6">
          DISCIPLINARY AND GRIEVANCE PROCEDURES
        </h2>
        <p>
         The Employee is subject to the Company’s disciplinary and grievance procedures, details of which are available upon request.
        </p>

        <h2 className="text-2xl font-bold mt-6">GOVERNING LAW</h2>
        <p>
          This Agreement shall be governed by and construed in accordance with
          the laws of England and Wales. Any disputes
          arising from this Agreement shall be subject to the exclusive
          jurisdiction of the courts of England and Wales.
        </p>

        <h2 className="text-2xl font-bold mt-6">SIGNED</h2>
        <p className="mb-3">
          <strong>For and on behalf of the Company:</strong>
        </p>
        <p>Signature: ___________________________</p>
        <p>
          Name: <span className="placeholder-authorized-representative">Authorized Representative</span>
        </p>
        <p>
          Title:{" "}
          <span className="placeholder-representative-title">Job Title of the authorized representative</span>
        </p>
        <p className="mb-3">
          Date: <span className="placeholder-signature-date">Date of signature</span>
        </p>
        <p className="mb-3">
          <strong>Employee:</strong>
        </p>
        <p>Signature: ___________________________</p>
        <p>
          Name: <span className="placeholder-employee-name">Employee Name</span>
        </p>
        <p>
          Date: <span className="placeholder-signing-date">Date of signing by Employee</span>
        </p>
      </div>
    </div>
  );
};

export default EmploymentAgreement;