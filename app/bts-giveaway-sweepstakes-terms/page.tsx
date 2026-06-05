import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'BTS Concert Sweepstakes — Official Rules | Aegyo Arena',
  description:
    'Official sweepstakes rules for the BTS Concert Sweepstakes at MetLife Stadium, East Rutherford, NJ on August 1, 2026.',
};

const h2: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 800,
  color: '#111',
  margin: '32px 0 10px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const p: React.CSSProperties = {
  margin: '0 0 14px',
  lineHeight: 1.75,
};

const notice: React.CSSProperties = {
  fontWeight: 700,
  margin: '0 0 14px',
  lineHeight: 1.75,
};

export default function SweepstakesTermsPage() {
  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '60px 24px 100px' }}>
      <div style={{ marginBottom: 32 }}>
        <Link href="/bts-giveaway" style={{ fontSize: '0.82rem', color: '#7B2FBE', textDecoration: 'none', fontWeight: 600 }}>
          ← Back to Giveaway
        </Link>
      </div>

      <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 900, color: '#111', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
        BTS Concert Sweepstakes (&ldquo;Sweepstakes&rdquo;)
      </h1>
      <p style={{ fontSize: '0.95rem', color: '#555', margin: '0 0 8px', fontWeight: 600 }}>
        MetLife Stadium &mdash; East Rutherford, NJ &mdash; August 1, 2026
      </p>
      <p style={{ fontSize: '1.05rem', fontWeight: 900, color: '#111', margin: '0 0 28px', letterSpacing: '0.06em' }}>
        OFFICIAL RULES
      </p>

      <div style={{ fontSize: '0.93rem', color: '#222' }}>
        <p style={p}>
          To enter this Sweepstakes, you must agree to and abide by these official rules
          (&ldquo;Official Rules&rdquo;).
        </p>
        <p style={p}>
          NO PURCHASE NECESSARY TO ENTER OR FOR A CHANCE TO WIN. A PURCHASE OR PAYMENT OF ANY KIND
          WILL NOT INCREASE YOUR CHANCES OF WINNING.
        </p>
        <p style={notice}>
          IMPORTANT NOTICE: THIS SWEEPSTAKES IS SUBJECT TO BINDING ARBITRATION AND A WAIVER OF
          CLASS ACTION RIGHTS. SEE SECTION 11 BELOW. IF YOU DO NOT AGREE TO BE BOUND BY THESE
          OFFICIAL RULES, YOU MAY NOT PARTICIPATE IN THE SWEEPSTAKES.
        </p>

        <h2 style={h2}>1. Sponsor</h2>
        <p style={p}>
          Myosin XYZ Network Inc., 3711 Parry Avenue, #104, Dallas, TX 75226
          (&ldquo;Sponsor&rdquo;).
        </p>

        <h2 style={h2}>2. Administrator</h2>
        <p style={p}>
          The Hand Media Group LLC, 149 East 23rd Street #637, New York, NY 10010
          (&ldquo;Administrator&rdquo;).
        </p>

        <h2 style={h2}>3. Eligibility</h2>
        <p style={p}>
          The Sweepstakes is open only to individuals who, at the time of entry into the
          Sweepstakes, are legal residents of the fifty (50) United States or the District of
          Columbia (D.C.) and are at least eighteen (18) years of age or the age of majority in
          their jurisdiction of residence, whichever is older. Any individuals (including but not
          limited to officers, directors, employees, consultants, independent contractors, and
          interns) who have, within the past six (6) months, performed services for Sponsor,
          Administrator, any organizations responsible for sponsoring, fulfilling, administering,
          advertising or promoting the Sweepstakes, and/or each of their respective parent,
          subsidiary, affiliated and successor companies, and immediate family members and household
          members of such individuals, are not eligible to enter or win any prize.
          &ldquo;Immediate family members&rdquo; shall mean parents, stepparents, children,
          stepchildren, siblings, stepsiblings, or spouses, regardless of where they live.
          &ldquo;Household members&rdquo; shall mean people who share the same residence at least
          three (3) months a year, whether related or not. Potential winners may be required to
          provide proof of residency and eligibility upon request prior to prize award. Sponsor and
          Administrator reserve the right to verify the eligibility of any entrant at any time. Void
          where prohibited or restricted by law.
        </p>

        <h2 style={h2}>4. Sweepstakes Entry</h2>
        <p style={p}>
          The Sweepstakes will occur during the period beginning June 1, 2026 at 12:00:01 a.m.
          Eastern Time (&ldquo;ET&rdquo;) and ending July 15, 2026 at 11:59:59 p.m. ET (the
          &ldquo;Sweepstakes Period&rdquo;). Administrator&apos;s designated database clock is the
          official timekeeping device for the Sweepstakes.
        </p>
        <p style={p}>To enter, follow the steps below:</p>
        <ol style={{ paddingLeft: 24, margin: '0 0 14px', lineHeight: 1.75 }}>
          <li style={{ marginBottom: 10 }}>
            Hand-print your full legal name, complete mailing address (no P.O. Boxes), email
            address, daytime telephone number, and date of birth on a 3&rdquo; x 5&rdquo; index
            card or piece of paper, along with the phrase &ldquo;BTS Sweepstakes Entry.&rdquo;
          </li>
          <li style={{ marginBottom: 10 }}>
            Place your entry in a hand-addressed envelope with sufficient postage and mail it to:
            BTS Sweepstakes, c/o The Hand Media Group LLC, 149 East 23rd Street #637, New York, NY
            10010.
          </li>
        </ol>
        <p style={p}>
          Each entry must be postmarked by July 10, 2026 and received by Administrator by July 14,
          2026 to be eligible. Entries that are illegible, incomplete, mutilated, mechanically
          reproduced, late, lost, misdirected, postage-due, or that otherwise fail to comply with
          these Official Rules will be deemed void and will not be entered into the random drawing.
          Proof of mailing does not constitute proof of delivery or receipt.
        </p>
        <p style={p}>
          Limit one (1) entry per person/household per Sweepstakes Period. Any attempt by any
          entrant to obtain more than the stated number of entries by using multiple or different
          names, identities, addresses, or any other methods, or by using any automated, programmed,
          or similar method, is prohibited and may void that entrant&apos;s entries and/or result in
          disqualification from the Sweepstakes, in Sponsor&apos;s and/or Administrator&apos;s sole
          discretion. All entries become the property of Sponsor and will not be acknowledged or
          returned.
        </p>
        <p style={p}>
          In the event of any dispute concerning the identity of any entrant, the entry will be
          deemed submitted by the natural person whose name and information are hand-printed on the
          entry, provided such person is otherwise eligible in accordance with these Official Rules.
        </p>

        <h2 style={h2}>5. Prize Random Drawing</h2>
        <p style={p}>
          One (1) potential Prize winner will be selected from among all eligible entries received
          during the Sweepstakes Period in a random drawing to be held on or about July 17, 2026.
          The random drawing will be conducted by Administrator using Chainlink VRF (Verifiable
          Random Function), a decentralized service that provides cryptographically secure, on-chain
          verifiable randomness for applications. Administrator will assign each eligible entry a
          unique sequential identifier and will use the random value produced by Chainlink VRF to
          deterministically select the winning entry from the pool of eligible entries.
        </p>
        <p style={p}>
          Administrator may, but is not required to, publish or otherwise make available the
          Chainlink VRF transaction identifier, request identifier, on-chain reference, and/or other
          verification information that allows the public to independently verify the integrity of
          the random selection. Administrator is an independent judging organization, and
          Administrator&apos;s decisions, together with the random value produced by Chainlink VRF,
          are final and binding on all matters related to the Sweepstakes. In the event of any
          technical failure, error, or unavailability of Chainlink VRF or the underlying blockchain
          network, Administrator may, in its sole discretion, retry the request, use an alternative
          cryptographically secure source of randomness, or conduct the drawing by another
          reasonable random method, in each case in a manner Administrator deems fair, appropriate,
          and consistent with the spirit of these Official Rules.
        </p>

        <h2 style={h2}>6. Winner Notification</h2>
        <p style={p}>
          The potential winner will be notified by Administrator via email and/or telephone using
          the contact information provided on the entry, on or about July 17, 2026. If a potential
          winner does not reply to such notification within three (3) days, if the notification is
          returned as undeliverable, and/or if a potential winner fails to timely return any
          required documents, such potential winner may be disqualified, and an alternate winner may
          be selected from among all remaining eligible entries received during the Sweepstakes
          Period. The potential winner may be required to complete, sign, and return within three
          (3) days of notification a Declaration of Eligibility, a Liability Release and
          Indemnification, and a Publicity Release (unless otherwise prohibited by law)
          (collectively, the &ldquo;Winner Documents&rdquo;). If the Winner Documents are not
          returned to Administrator within the specified time period, or if the potential winner is
          found to be ineligible, is otherwise not in compliance with these Official Rules, or
          declines the prize for any reason prior to award, the prize may be forfeited and the
          potential winner may be disqualified. If the potential winner is disqualified for any
          reason, an alternate winner may be selected from among all remaining eligible entries.
        </p>

        <h2 style={h2}>7. Prize / Odds / Approximate Retail Value</h2>
        <p style={p}>
          One (1) prize is available to be awarded as part of the Sweepstakes (the
          &ldquo;Prize&rdquo;). The Prize consists of: (a) two (2) premium tickets to the BTS
          concert scheduled to take place on August 1, 2026 at MetLife Stadium, East Rutherford,
          New Jersey, with seat locations selected by Sponsor in its sole discretion, subject to
          availability (approximate retail value: $2,200 USD); and (b) one (1) BTS official
          merchandise package, the contents of which shall be selected by Sponsor in its sole
          discretion, subject to availability (approximate retail value: $300 USD). For purposes
          hereof, &ldquo;premium tickets&rdquo; shall mean tickets for seating locations in the
          floor, lower bowl, or other comparably preferred seating area at the venue, as determined
          by Sponsor in its sole discretion. The total approximate retail value (&ldquo;ARV&rdquo;)
          of the Prize is Two Thousand Five Hundred U.S. Dollars ($2,500).
        </p>
        <p style={p}>
          If, for any reason, BTS concert tickets are unavailable, the scheduled concert is
          postponed, rescheduled, relocated, or cancelled, or any Prize component (including the
          merchandise package or any item therein) becomes unavailable for any reason, Sponsor may,
          in its sole discretion, award a substitute prize or prize component of equal or greater
          approximate retail value, or cancel the affected Prize component without further
          obligation.
        </p>
        <p style={p}>
          Prize consists of the tickets and merchandise package described above only. Any and all
          costs and expenses associated with Prize acceptance and use that are not specifically
          included in the Prize description above, including, without limitation, transportation to
          and from the venue, lodging, meals, gratuities, parking, insurance, shipping costs in
          excess of standard delivery for the merchandise package, and other expenses, are the sole
          responsibility of the winner.
        </p>
        <p style={p}>
          Tickets are subject to the terms and conditions specified thereon and to venue policies
          and procedures. Seat locations will be determined by Sponsor in its sole discretion.
          Winner and guest must comply with all venue rules, regulations, age restrictions, health
          and safety requirements, and ticketing terms and conditions. Failure to do so may result
          in forfeiture of the Prize or the affected Prize component. If the winner elects to attend
          the concert with a guest who is a minor under the law of the guest&apos;s jurisdiction of
          residence, the guest must be accompanied by the winner or the guest&apos;s parent/legal
          guardian, as required by applicable law and venue policy. The merchandise package will be
          shipped to the winner at the U.S. mailing address provided on the entry, generally within
          thirty (30) days following winner verification; Sponsor and Administrator are not
          responsible for any loss, theft, damage, or delay in transit.
        </p>
        <p style={p}>
          Limit one (1) Prize per person/household. The Prize must be accepted as awarded. No
          substitution, assignment, or transfer of the Prize or any Prize component shall occur
          except with Sponsor&apos;s permission or where required by law. The Prize is not
          redeemable or exchangeable for cash. Sponsor in its sole discretion may award a substitute
          prize or prize component of equal or greater value if any prize or prize component is
          unavailable at the time of awarding for any reason whatsoever.
        </p>
        <p style={p}>
          The winner shall be solely responsible for any applicable federal, state, and local taxes
          and/or local laws and regulations, and the reporting consequences thereof, and for any
          other fees or costs associated with the Prize. A winner of a Prize valued at Six Hundred
          Dollars ($600) or more will receive an IRS Form 1099 for the total value of the Prize
          received, if required by law.
        </p>
        <p style={p}>
          Odds of winning the Prize depend on the total number of eligible entries received during
          the Sweepstakes Period.
        </p>

        <h2 style={h2}>8. Publicity</h2>
        <p style={p}>
          Except where prohibited by applicable law, acceptance of the Prize constitutes the
          winner&apos;s consent to Sponsor&apos;s and its designees&apos; use of winner&apos;s
          name, likeness, photograph, voice, biographical information, statements, and/or city and
          state of residence for advertising, publicity, and promotional purposes in connection with
          the Sweepstakes and/or awarding of the Prize in any and all media now known or hereafter
          devised, worldwide, in perpetuity, without compensation or remuneration for such use or
          further notice, review, or approval of any kind.
        </p>

        <h2 style={h2}>9. Limitations of Liability</h2>
        <p style={p}>
          Neither Sponsor, Administrator, nor any of the other Released Parties (as defined below)
          is responsible for: (a) failed, partial, garbled, or delayed transmissions or mail;
          (b) technical failures of any kind, including, without limitation, malfunctions of any
          network, hardware, software, website, platform, or service provider; (c) human,
          typographical, printing, or other errors; (d) late, lost, undeliverable, damaged, stolen,
          intercepted, misdirected, postage-due, or delayed mail, email, entries, or communications;
          or (e) any injury, loss, or damage to persons or property arising out of or relating to,
          in whole or in part, entrant&apos;s participation in the Sweepstakes or the receipt,
          acceptance, possession, use, inability to use, or misuse of the Prize. If for any reason
          the Sweepstakes is not capable of running as planned (in whole or in part), whether due to
          tampering, unauthorized intervention, fraud, technical failures, force majeure, or any
          other causes beyond Sponsor&apos;s reasonable control that corrupt or affect the
          administration, security, fairness, integrity or proper conduct of the Sweepstakes,
          Sponsor reserves the right, in its sole discretion, to cancel, terminate, modify or
          suspend the Sweepstakes, in whole or in part, and/or disqualify any individual who
          tampers with (or attempts to tamper with) the entry process or the operation of the
          Sweepstakes. In such event, Sponsor and/or Administrator may, in their sole discretion,
          conduct the Sweepstakes and/or award the Prize in a manner they deem fair, appropriate
          and consistent with the spirit of these Official Rules, including by selecting the winner
          from among all non-suspect, eligible entries received prior to the action taken or as
          otherwise deemed appropriate, as determined by Sponsor and/or Administrator in their sole
          discretion.
        </p>
        <p style={p}>
          Entrants agree not to knowingly damage or cause interruption of the Sweepstakes and/or
          prevent others from participating in the Sweepstakes. CAUTION: ANY ATTEMPT TO UNDERMINE
          THE LEGITIMATE OPERATION OF THE SWEEPSTAKES MAY VIOLATE CRIMINAL OR CIVIL LAWS. IF SUCH
          AN ATTEMPT IS MADE OR AN INDIVIDUAL OTHERWISE ATTEMPTS TO DEFRAUD SPONSOR AND/OR
          ADMINISTRATOR, SPONSOR AND/OR ADMINISTRATOR RESERVE THE RIGHT TO DISQUALIFY ANY ENTRANT
          MAKING SUCH ATTEMPT AND SEEK DAMAGES AND OTHER REMEDIES TO THE FULLEST EXTENT PERMITTED
          BY LAW.
        </p>

        <h2 style={h2}>10. Release and Indemnification</h2>
        <p style={p}>
          By entering or participating in the Sweepstakes, each entrant, on behalf of such entrant
          and such entrant&apos;s heirs, executors, administrators, successors, and assigns, agrees:
          (a) to be bound by and abide by these Official Rules and the decisions of Sponsor and
          Administrator, which shall be final and binding in all respects; (b) to the fullest extent
          permitted by applicable law, to release, indemnify and hold harmless Sponsor,
          Administrator, each of their respective parent, subsidiary, affiliated, and successor
          companies, advertising and promotion agencies, and each of their respective officers,
          directors, agents, representatives and employees, as well as each of their respective
          successors, representatives and assigns (collectively, the &ldquo;Released
          Parties&rdquo;), from and against any and all claims, damages, actions, liability, loss,
          injury or expense (including, without limitation, reasonable attorneys&apos; fees and
          costs) arising out of or related to this Sweepstakes in any manner, including, without
          limitation, any and all actions, claims, liabilities, injury, death, loss or damage to
          person(s) or property arising in any manner, directly or indirectly, from participation
          in this Sweepstakes and/or the acceptance, possession, receipt, use or misuse of the
          Prize (collectively, &ldquo;Claims&rdquo;), in each case, whether or not arising from the
          negligence of a Released Party; (c) that, except to the extent prohibited by applicable
          law, entrant waives any right to seek indirect, incidental, consequential, or punitive
          damages arising out of or relating to the Sweepstakes or the Prize; (d) to assume all
          risks, express or implied, associated with all Claims released above, including, without
          limitation, all risks concerning entry into and participation in the Sweepstakes; and
          (e) that NEITHER SPONSOR NOR ANY OF THE RELEASED PARTIES HAVE MADE OR MAKE OR ARE
          RESPONSIBLE OR LIABLE FOR ANY WARRANTY, REPRESENTATION OR GUARANTEE, EXPRESS OR IMPLIED,
          RELATIVE TO THIS SWEEPSTAKES OR THE PRIZE, INCLUDING BUT NOT LIMITED TO, ITS QUALITY OR
          FITNESS OR MERCHANTABILITY, AND THE PRIZE IS TENDERED TO THE WINNER ON AN &ldquo;AS
          IS&rdquo; BASIS. THERE ARE NO WARRANTIES THAT EXTEND BEYOND THE DESCRIPTION ON THE FACE
          OF ANY PROMOTIONS OR MATERIALS OF THE PRIZE. NOTHING IN THESE OFFICIAL RULES SHALL
          EXCLUDE OR LIMIT ANY LIABILITY THAT MAY NOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.
        </p>

        <h2 style={h2}>11. Binding Arbitration</h2>
        <p style={p}>
          PLEASE READ THIS SECTION CAREFULLY. IT AFFECTS YOUR LEGAL RIGHTS. The parties waive all
          rights to trial in any action or proceeding instituted in connection with these Official
          Rules and/or this Sweepstakes. Any controversy, claim, or dispute arising out of or
          relating to these Official Rules and/or this Sweepstakes shall be resolved exclusively by
          final and binding arbitration administered by JAMS in accordance with its applicable
          consumer arbitration rules then in effect. Any such arbitration shall be conducted on an
          individual basis only and shall not be consolidated with any claim or controversy of any
          other party, and the arbitrator shall have no authority to consider or resolve any claim
          or issue as a class, collective, or representative action. The arbitration shall be
          conducted in Los Angeles, California, unless the applicable rules of JAMS or applicable
          law require otherwise. Judgment on the arbitration award may be entered in any court
          having jurisdiction thereof.
        </p>

        <h2 style={h2}>12. Governing Law and Jurisdiction</h2>
        <p style={p}>
          This Sweepstakes is governed by the laws of the United States and the State of
          California, without giving effect to California&apos;s conflict of laws principles, and is
          subject to all applicable federal, state, and local laws and regulations. Void where
          prohibited by law. All issues and questions concerning the construction, validity,
          interpretation and enforceability of these Official Rules, or the rights and obligations
          of entrant, Sponsor, and Administrator in connection with this Sweepstakes, shall be
          governed by, and construed in accordance with, the laws of the State of California,
          U.S.A., without giving effect to the conflict of laws rules thereof, and any matters or
          proceedings not subject to arbitration under these Official Rules, and any proceedings to
          confirm, vacate, or enforce an arbitration award, shall be brought exclusively in the
          state or federal courts located in Los Angeles County, California, and each entrant
          consents to the jurisdiction and venue of such courts.
        </p>

        <h2 style={h2}>13. Miscellaneous</h2>
        <p style={p}>
          The invalidity or unenforceability of any provision of these Official Rules will not
          affect the validity or enforceability of any other provision. In the event that any
          provision of the Official Rules is determined by a court, arbitrator, or other tribunal of
          competent jurisdiction to be invalid, unenforceable, or illegal, the remaining provisions
          will remain in full force and effect and will be construed in accordance with their terms
          as if the invalid, unenforceable, or illegal provision were not contained herein.
          Sponsor&apos;s and/or Administrator&apos;s failure to enforce any term of these Official
          Rules in any instance will not constitute a waiver of that provision. Entrants agree to
          waive any right to claim ambiguity of these Official Rules. In the event there is a
          discrepancy or inconsistency between disclosures or other statements contained in any
          Sweepstakes-related materials, privacy policy or terms of use on any website, social media
          platform or application and/or the terms and conditions of these Official Rules, these
          Official Rules shall prevail, govern and control and the discrepancy will be resolved in
          Sponsor&apos;s sole and absolute discretion.
        </p>

        <h2 style={h2}>14. Privacy Policy</h2>
        <p style={p}>
          Any personal information supplied by an entrant in connection with the Sweepstakes will be
          subject to Sponsor&apos;s Privacy Policy, available at{' '}
          <Link href="/privacy-policy" style={{ color: '#7B2FBE' }}>
            aegyoarena.com/privacy-policy
          </Link>
          , and may be shared with Administrator and third-party service providers for purposes of
          Sweepstakes administration, winner verification, prize fulfillment, or as otherwise
          described in Sponsor&apos;s Privacy Policy.
        </p>

        <h2 style={h2}>15. Winners&apos; List</h2>
        <p style={p}>
          For the name of the winner, mail a self-addressed, stamped envelope to: BTS Sweepstakes
          Winners, c/o The Hand Media Group LLC, 149 East 23rd Street #637, New York, NY 10010. All
          such requests must be received by August 15, 2026.
        </p>

        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid #e5e5e5', fontSize: '0.8rem', color: '#999' }}>
          Questions? Contact{' '}
          <a href="mailto:hello@aegyoarena.com" style={{ color: '#7B2FBE' }}>
            hello@aegyoarena.com
          </a>
        </div>
      </div>
    </main>
  );
}
