// 10 sample agreements designed to demo every use case the chat app supports:
//   - "Find all NDAs with Acme Corp"          → #1
//   - "Find all agreements with Acme Corp"    → #1, #10
//   - "Expiring in the next 30 days"          → #10
//   - "Expiring in the next 90 days"          → #1, #10, plus #8 within renewal-notice window
//   - "Which contracts auto-renew?"           → #2, #8
//   - "/review-contract <id>" red flags       → #10 (one-sided indemnity + uncapped LoL)
//   - "/triage-nda <id>"                      → #1
//   - Compliance / DPA workflows              → #9
//   - Variety: employment (#4), license (#5), lease (#6), contractor (#7), consulting (#3)

export type Sample = {
  filename: string;
  title: string;
  effectiveDate: string;
  party1: string;
  party2: string;
  body: string;
};

export const SAMPLES: Sample[] = [
  {
    filename: "01-mutual-nda-acme.pdf",
    title: "MUTUAL NON-DISCLOSURE AGREEMENT",
    effectiveDate: "February 15, 2026",
    party1: "Parsa Industries, LLC",
    party2: "Acme Corp",
    body: `This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of February 15, 2026 (the "Effective Date") by and between Parsa Industries, LLC, a Delaware limited liability company ("Parsa Industries"), and Acme Corp, a California corporation ("Acme") (each a "Party" and collectively the "Parties").

1. PURPOSE. The Parties wish to evaluate a potential commercial relationship and may disclose Confidential Information for that purpose only.

2. CONFIDENTIAL INFORMATION. "Confidential Information" means non-public business, technical, financial, or commercial information disclosed by one Party (the "Disclosing Party") to the other (the "Receiving Party") that is marked confidential or that a reasonable person would understand to be confidential under the circumstances.

3. OBLIGATIONS. The Receiving Party shall: (a) use Confidential Information solely for the Purpose; (b) protect it with at least the same degree of care it uses for its own confidential information, but no less than reasonable care; and (c) not disclose it to any third party without the Disclosing Party's prior written consent.

4. EXCLUSIONS. Confidential Information does not include information that: (a) is or becomes publicly known through no fault of the Receiving Party; (b) was known to the Receiving Party prior to disclosure; (c) is independently developed without use of Confidential Information; or (d) is rightfully received from a third party without confidentiality obligations.

5. TERM. This Agreement shall be effective for four (4) months from the Effective Date, expiring on June 15, 2026. Confidentiality obligations shall survive for three (3) years following expiration or termination.

6. NO LICENSE. Nothing herein grants any license or right under any intellectual property of the other Party, except the limited right to use Confidential Information solely for the Purpose.

7. RETURN OF MATERIALS. Upon written request, the Receiving Party shall return or destroy all Confidential Information in its possession.

8. GOVERNING LAW. This Agreement shall be governed by the laws of the State of Delaware, without regard to conflict-of-laws principles. Any dispute arising hereunder shall be brought exclusively in the state or federal courts located in Wilmington, Delaware.

9. ENTIRE AGREEMENT. This Agreement constitutes the entire understanding between the Parties regarding its subject matter and supersedes any prior agreements, written or oral.`,
  },
  {
    filename: "02-saas-msa-globex.pdf",
    title: "SAAS MASTER SERVICES AGREEMENT",
    effectiveDate: "September 1, 2025",
    party1: "Parsa Industries, LLC",
    party2: "Globex Solutions, Inc.",
    body: `This SaaS Master Services Agreement ("Agreement") is made as of September 1, 2025 (the "Effective Date") between Parsa Industries, LLC ("Customer") and Globex Solutions, Inc. ("Globex" or "Provider").

1. SERVICES. Globex shall provide Customer with access to its cloud-based analytics platform (the "Services") in accordance with this Agreement and the applicable Order Form.

2. FEES. Customer shall pay Globex an annual subscription fee of one hundred twenty thousand U.S. dollars (USD $120,000), invoiced annually in advance. Fees are non-refundable except as expressly provided herein.

3. TERM AND RENEWAL. The initial term of this Agreement shall be twelve (12) months, commencing on the Effective Date and ending on August 31, 2026. Thereafter, this Agreement shall automatically renew for successive one-year terms unless either Party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.

4. INDEMNIFICATION. Each Party shall indemnify, defend, and hold harmless the other from third-party claims arising out of (a) the indemnifying Party's breach of this Agreement, (b) infringement of intellectual property rights by the indemnifying Party's products or materials, or (c) the indemnifying Party's gross negligence or willful misconduct.

5. LIMITATION OF LIABILITY. EXCEPT FOR BREACHES OF CONFIDENTIALITY OR INDEMNIFICATION OBLIGATIONS, EACH PARTY'S TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT SHALL NOT EXCEED THE AMOUNTS PAID OR PAYABLE BY CUSTOMER TO GLOBEX IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM. NEITHER PARTY SHALL BE LIABLE FOR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.

6. DATA SECURITY. Globex shall maintain industry-standard security controls including encryption in transit and at rest, SOC 2 Type II compliance, and annual third-party penetration testing.

7. SERVICE LEVEL. Globex shall make the Services available with 99.9% monthly uptime, with service credits as set forth in the SLA Exhibit.

8. TERMINATION FOR CAUSE. Either Party may terminate this Agreement upon thirty (30) days' written notice for material breach not cured within such period.

9. GOVERNING LAW. This Agreement shall be governed by the laws of the State of New York.`,
  },
  {
    filename: "03-consulting-initech.pdf",
    title: "CONSULTING SERVICES AGREEMENT",
    effectiveDate: "January 15, 2026",
    party1: "Parsa Industries, LLC",
    party2: "Initech LLC",
    body: `This Consulting Services Agreement ("Agreement") is entered into on January 15, 2026 (the "Effective Date") between Parsa Industries, LLC ("Client") and Initech LLC ("Consultant").

1. SERVICES. Consultant shall provide infrastructure modernization advisory services as described in Exhibit A.

2. TERM. The term of this Agreement shall begin on the Effective Date and shall continue through September 30, 2026, unless earlier terminated in accordance with Section 7. There is no automatic renewal.

3. FEES. Client shall pay Consultant a fixed monthly fee of twenty-five thousand U.S. dollars (USD $25,000), invoiced on the first business day of each month, due net thirty (30) days.

4. INTELLECTUAL PROPERTY. All deliverables, work product, and inventions created by Consultant in the course of performing the Services shall be the sole and exclusive property of Client. Consultant hereby assigns all right, title, and interest in such work product to Client.

5. CONFIDENTIALITY. Consultant shall maintain in strict confidence all non-public information of Client and shall not disclose it to any third party. This obligation shall survive termination for five (5) years.

6. INDEPENDENT CONTRACTOR. Consultant is an independent contractor and not an employee, agent, or partner of Client. Consultant is responsible for its own taxes, benefits, and insurance.

7. TERMINATION FOR CONVENIENCE. Either Party may terminate this Agreement at any time, with or without cause, upon thirty (30) days' written notice. Client shall pay for Services performed up to the date of termination.

8. NON-SOLICITATION. During the term and for twelve (12) months thereafter, neither Party shall solicit for employment any employee of the other Party without prior written consent.

9. GOVERNING LAW. This Agreement shall be governed by the laws of the State of Texas.`,
  },
  {
    filename: "04-employment-offer-chen.pdf",
    title: "OFFER OF EMPLOYMENT",
    effectiveDate: "March 1, 2026",
    party1: "Parsa Industries, LLC",
    party2: "Sarah Chen",
    body: `Parsa Industries, LLC ("Company") is pleased to offer Sarah Chen ("Employee") employment on the following terms, effective March 1, 2026 (the "Start Date").

1. POSITION. Employee shall serve as Senior Software Engineer, reporting to the VP of Engineering.

2. COMPENSATION. Annual base salary of one hundred eighty thousand U.S. dollars (USD $180,000), payable in accordance with Company's standard payroll practices. Employee shall be eligible for an annual performance bonus targeted at fifteen percent (15%) of base salary.

3. EQUITY. Subject to Board approval, Employee shall be granted ten thousand (10,000) restricted stock units, vesting over four (4) years with a one-year cliff.

4. BENEFITS. Employee shall be entitled to participate in Company's standard benefit programs, including medical, dental, vision, 401(k), and unlimited PTO.

5. AT-WILL EMPLOYMENT. Employment with the Company is at-will. Either Party may terminate the employment relationship at any time, with or without cause and with or without notice. Nothing in this letter creates a contract for any specific duration of employment.

6. CONFIDENTIALITY AND IP ASSIGNMENT. Employee shall execute the Company's standard Confidential Information and Invention Assignment Agreement as a condition of employment. All inventions, discoveries, and works created during employment that relate to the Company's business shall be the sole property of the Company.

7. NON-COMPETITION. During employment and for six (6) months thereafter, Employee shall not, directly or indirectly, engage in any business that competes with the Company within the United States.

8. CONTINGENCIES. This offer is contingent upon (a) successful completion of a background check, (b) verification of Employee's right to work in the United States, and (c) execution of the Confidentiality Agreement.

9. GOVERNING LAW. This offer shall be governed by the laws of the State of California.`,
  },
  {
    filename: "05-software-license-hooli.pdf",
    title: "SOFTWARE LICENSE AGREEMENT",
    effectiveDate: "December 1, 2025",
    party1: "Parsa Industries, LLC",
    party2: "Hooli Cloud Inc.",
    body: `This Software License Agreement ("Agreement") is entered into as of December 1, 2025 (the "Effective Date") between Hooli Cloud Inc. ("Licensor") and Parsa Industries, LLC ("Licensee").

1. LICENSE GRANT. Subject to the terms hereof, Licensor grants Licensee a non-exclusive, non-transferable, worldwide license to use the Hooli Distributed Compute Platform (the "Software") solely for Licensee's internal business operations.

2. TERM. This Agreement shall commence on the Effective Date and shall continue for a period of three (3) years, expiring on December 1, 2028, unless earlier terminated in accordance with this Agreement. Renewal shall be by mutual written agreement; this Agreement does not renew automatically.

3. FEES. Licensee shall pay Licensor an annual license fee of fifty thousand U.S. dollars (USD $50,000), payable in advance on each anniversary of the Effective Date.

4. RESTRICTIONS. Licensee shall not (a) reverse engineer, decompile, or disassemble the Software; (b) sublicense, sell, or distribute the Software to third parties; (c) use the Software to develop a competing product; or (d) remove or obscure any proprietary notices.

5. SUPPORT. Licensor shall provide email-based technical support during business hours (Monday-Friday, 9 AM - 6 PM Pacific) and software updates as commercially released.

6. INDEMNIFICATION. Each Party shall indemnify the other against third-party claims arising from its breach of this Agreement or its gross negligence or willful misconduct.

7. LIMITATION OF LIABILITY. EACH PARTY'S TOTAL LIABILITY UNDER THIS AGREEMENT SHALL NOT EXCEED THE GREATER OF (A) FEES PAID BY LICENSEE IN THE TWENTY-FOUR (24) MONTHS PRECEDING THE CLAIM OR (B) ONE HUNDRED THOUSAND U.S. DOLLARS (USD $100,000). THE FOREGOING LIMITATION SHALL NOT APPLY TO BREACHES OF CONFIDENTIALITY, INTELLECTUAL PROPERTY INDEMNIFICATION, OR WILLFUL MISCONDUCT.

8. GOVERNING LAW. This Agreement shall be governed by the laws of the State of California.`,
  },
  {
    filename: "06-office-lease-220-market.pdf",
    title: "COMMERCIAL OFFICE LEASE",
    effectiveDate: "July 1, 2024",
    party1: "Parsa Industries, LLC",
    party2: "220 Market Street LLC",
    body: `This Commercial Office Lease ("Lease") is made as of July 1, 2024 (the "Commencement Date") between 220 Market Street LLC, a California limited liability company ("Landlord"), and Parsa Industries, LLC ("Tenant").

1. PREMISES. Landlord leases to Tenant approximately 4,200 rentable square feet on the 7th floor of the building located at 220 Market Street, San Francisco, CA 94105 (the "Premises").

2. TERM. The term of this Lease shall be sixty (60) months, commencing on July 1, 2024 and expiring on June 30, 2029 (the "Expiration Date").

3. BASE RENT. Tenant shall pay monthly Base Rent of fourteen thousand U.S. dollars (USD $14,000), due on the first day of each month. Base Rent shall increase by three percent (3%) annually on each anniversary of the Commencement Date.

4. SECURITY DEPOSIT. Tenant has deposited with Landlord forty-two thousand U.S. dollars (USD $42,000) as security for performance of Tenant's obligations.

5. USE. The Premises shall be used solely for general office purposes and for no other use without Landlord's prior written consent.

6. OPERATING EXPENSES. Tenant shall pay its proportionate share of Operating Expenses in excess of the Base Year (calendar year 2024) amounts.

7. ASSIGNMENT AND SUBLETTING. Tenant shall not assign this Lease or sublet the Premises without Landlord's prior written consent, which shall not be unreasonably withheld.

8. INSURANCE. Tenant shall maintain commercial general liability insurance with limits of at least two million dollars (USD $2,000,000) per occurrence.

9. RENEWAL OPTION. Tenant shall have the option to extend the term for one (1) additional five (5) year period at fair market rent, exercisable by written notice to Landlord no later than nine (9) months before the Expiration Date.

10. GOVERNING LAW. This Lease shall be governed by the laws of the State of California.`,
  },
  {
    filename: "07-contractor-dunder-mifflin.pdf",
    title: "INDEPENDENT CONTRACTOR AGREEMENT",
    effectiveDate: "February 1, 2026",
    party1: "Parsa Industries, LLC",
    party2: "Dunder Mifflin Print Services Inc.",
    body: `This Independent Contractor Agreement ("Agreement") is entered into on February 1, 2026 (the "Effective Date") between Parsa Industries, LLC ("Company") and Dunder Mifflin Print Services Inc. ("Contractor").

1. SERVICES. Contractor shall provide on-demand commercial printing services, including business cards, marketing materials, and branded merchandise, as requested by Company from time to time.

2. TERM. This Agreement shall commence on the Effective Date and continue on a month-to-month basis until terminated by either Party. Either Party may terminate this Agreement for any reason or no reason upon fifteen (15) days' written notice.

3. COMPENSATION. Contractor shall invoice Company a flat monthly retainer of five thousand U.S. dollars (USD $5,000), plus reimbursement for materials at cost. Invoices are due net thirty (30) days.

4. INDEPENDENT CONTRACTOR. Contractor is an independent contractor and not an employee of Company. Contractor is solely responsible for its own taxes, insurance, and employee obligations.

5. INTELLECTUAL PROPERTY. Any creative or design work produced specifically for Company shall be a work-made-for-hire owned by Company. Contractor's pre-existing tools, templates, and methodologies remain Contractor's property.

6. CONFIDENTIALITY. Each Party shall protect the other's confidential information using reasonable care, both during the term and for two (2) years thereafter.

7. INDEMNIFICATION. Contractor shall indemnify Company against any third-party claims arising from Contractor's negligence or willful misconduct.

8. LIMITATION OF LIABILITY. CONTRACTOR'S TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID BY COMPANY IN THE PRECEDING TWELVE (12) MONTHS.

9. GOVERNING LAW. This Agreement shall be governed by the laws of the Commonwealth of Pennsylvania.`,
  },
  {
    filename: "08-reseller-stark.pdf",
    title: "RESELLER AGREEMENT",
    effectiveDate: "August 15, 2025",
    party1: "Parsa Industries, LLC",
    party2: "Stark Industries, Inc.",
    body: `This Reseller Agreement ("Agreement") is made as of August 15, 2025 (the "Effective Date") between Stark Industries, Inc. ("Vendor") and Parsa Industries, LLC ("Reseller").

1. APPOINTMENT. Vendor appoints Reseller as a non-exclusive authorized reseller of Vendor's enterprise security products (the "Products") in the United States.

2. TERM AND AUTO-RENEWAL. The initial term of this Agreement shall be twelve (12) months, commencing on the Effective Date and expiring on August 14, 2026. This Agreement shall automatically renew for successive one-year periods unless either Party provides written notice of non-renewal at least ninety (90) days prior to the end of the then-current term. Reseller acknowledges the upcoming renewal-decision date of May 17, 2026.

3. PRICING AND DISCOUNTS. Reseller shall purchase Products at Vendor's then-current MSRP less a thirty percent (30%) reseller discount. Reseller may resell at any price.

4. MINIMUM COMMITMENT. Reseller shall purchase a minimum of two hundred thousand U.S. dollars (USD $200,000) in Products during each twelve-month period.

5. TERMINATION FOR CONVENIENCE. Either Party may terminate this Agreement for convenience upon ninety (90) days' written notice.

6. INDEMNIFICATION. Vendor shall indemnify Reseller against third-party claims that the Products infringe any U.S. patent, copyright, or trade secret. Reseller shall indemnify Vendor for claims arising from Reseller's marketing materials or modifications to the Products.

7. LIMITATION OF LIABILITY. EACH PARTY'S TOTAL LIABILITY SHALL NOT EXCEED THE FEES PAID OR PAYABLE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, EXCEPT FOR INDEMNIFICATION OBLIGATIONS WHICH ARE UNCAPPED FOR INTELLECTUAL PROPERTY CLAIMS.

8. GOVERNING LAW. This Agreement shall be governed by the laws of the State of New York.`,
  },
  {
    filename: "09-dpa-pied-piper.pdf",
    title: "DATA PROCESSING ADDENDUM",
    effectiveDate: "March 15, 2026",
    party1: "Parsa Industries, LLC",
    party2: "Pied Piper, Inc.",
    body: `This Data Processing Addendum ("DPA") is entered into on March 15, 2026 (the "Effective Date") between Parsa Industries, LLC ("Controller") and Pied Piper, Inc. ("Processor"), and forms part of the SaaS Master Services Agreement between the Parties dated January 10, 2026 (the "Principal Agreement").

1. SCOPE. This DPA applies to Processor's processing of Personal Data on behalf of Controller in connection with the services provided under the Principal Agreement.

2. PROCESSING. Processor shall process Personal Data only on documented instructions from Controller, including transfers to third countries, except as required by applicable law.

3. CONFIDENTIALITY. Processor shall ensure that personnel authorized to process Personal Data are subject to appropriate confidentiality obligations.

4. SECURITY. Processor shall implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk, including: (a) encryption of Personal Data in transit and at rest; (b) ongoing confidentiality, integrity, availability, and resilience of processing systems; (c) timely restoration of availability following an incident; and (d) regular testing and evaluation of security measures.

5. SUB-PROCESSORS. Processor shall not engage any sub-processor without Controller's prior written authorization. Processor shall maintain a current list of approved sub-processors and notify Controller of any intended changes.

6. DATA SUBJECT RIGHTS. Processor shall, taking into account the nature of the processing, assist Controller by appropriate technical and organizational measures, in fulfilling Controller's obligations to respond to requests from data subjects exercising rights under GDPR Articles 15-22 and CCPA Sections 1798.100-1798.130.

7. BREACH NOTIFICATION. Processor shall notify Controller without undue delay, and in any event within seventy-two (72) hours, after becoming aware of a Personal Data Breach.

8. AUDIT RIGHTS. Processor shall make available to Controller all information necessary to demonstrate compliance with this DPA and shall allow for and contribute to audits, including inspections, conducted by Controller or another auditor mandated by Controller, no more than once per calendar year.

9. INTERNATIONAL TRANSFERS. To the extent Processor processes Personal Data of EU/EEA data subjects outside the EEA, the Parties shall execute the Standard Contractual Clauses adopted by the European Commission.

10. RETURN OR DELETION. Upon termination of the Principal Agreement, Processor shall, at Controller's choice, return or delete all Personal Data, unless retention is required by applicable law.`,
  },
  {
    filename: "10-vendor-services-acme.pdf",
    title: "VENDOR SERVICES AGREEMENT",
    effectiveDate: "November 15, 2025",
    party1: "Parsa Industries, LLC",
    party2: "Acme Corp",
    body: `This Vendor Services Agreement ("Agreement") is entered into as of November 15, 2025 (the "Effective Date") between Acme Corp ("Vendor") and Parsa Industries, LLC ("Customer").

1. SERVICES. Vendor shall provide on-site facility maintenance services as detailed in Exhibit A.

2. TERM. This Agreement shall be effective for a period of six (6) months from the Effective Date, expiring on May 15, 2026. There is no automatic renewal; renewal shall be by mutual written agreement.

3. FEES. Customer shall pay Vendor a total fixed fee of seventy-five thousand U.S. dollars (USD $75,000), invoiced in three equal installments at the start of months one, three, and five.

4. INDEMNIFICATION. Customer shall indemnify, defend, and hold harmless Vendor and its officers, directors, employees, and affiliates from and against any and all claims, losses, damages, liabilities, costs, and expenses (including reasonable attorneys' fees) arising out of or in any way related to (a) the Services, (b) Customer's use of the Services, (c) any breach of this Agreement by Customer, or (d) any acts or omissions of Customer. This indemnity shall apply regardless of whether the claim arises from Vendor's negligence. Vendor has no reciprocal indemnification obligation under this Agreement.

5. LIMITATION OF LIABILITY. NOTWITHSTANDING ANYTHING TO THE CONTRARY, THE PARTIES AGREE THAT VENDOR'S LIABILITY SHALL NOT BE LIMITED IN ANY WAY, AND THAT VENDOR SHALL HAVE NO CAP, EXCLUSION, OR LIMITATION OF LIABILITY UNDER OR ARISING FROM THIS AGREEMENT, INCLUDING WITHOUT LIMITATION FOR DIRECT, INDIRECT, INCIDENTAL, CONSEQUENTIAL, AND PUNITIVE DAMAGES. Customer's liability shall be capped at the amounts paid by Customer to Vendor under this Agreement.

6. INSURANCE. Vendor shall maintain commercial general liability insurance with limits of at least five million dollars (USD $5,000,000) per occurrence and ten million dollars (USD $10,000,000) aggregate.

7. INTELLECTUAL PROPERTY. Any work product produced by Vendor in the course of performing the Services shall remain the property of Vendor. Customer shall receive a perpetual, royalty-free license to use such work product solely for Customer's internal business purposes.

8. TERMINATION. Either Party may terminate this Agreement for material breach not cured within thirty (30) days of written notice.

9. GOVERNING LAW. This Agreement shall be governed by the laws of the State of California.`,
  },
];
