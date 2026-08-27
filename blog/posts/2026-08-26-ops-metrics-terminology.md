A glossary of terms and related knowledge that I built during an operations internship at a major tech company.

## Abbreviations

<p class="definition">Understand dashboards.</p>

| Abbreviation | Full form | English meaning |
| --- | --- | --- |
| DAU | Daily Active Users | Users active in a day. |
| UV | Unique Visitor | De-duplicated users or creators. |
| PV | Page View / Impression Page View | Total non-unique views or exposures. |
| VV | Video Views | Total video plays. |
| ACU | Average Concurrent Users | Average simultaneous viewers during a live. |
| NR | Not Recommended | Traffic is not proactively recommended. |
| KYC | Know Your Customer | Individual identity verification. |
| KYB | Know Your Business | Business identity verification. |
| CTA | Call To Action | A direct prompt telling viewers what to do next. |
| CM | Creator Manager | The operator who manages or coaches creators. |
| CRM | Customer Relationship Management | A system for storing and managing customer or lead data. |
| DM | Direct Message | Private messaging between viewer and creator. |
| DFO | Deep Funnel Optimization | Optimization based on deeper conversion outcomes. |
| RBA | Registered Business Account | Business-account status following business verification. |
| RC | Reproduced Content | Replayed or non-original content presented as live. |
| NCA | New Customer Acquisition | A downstream new-customer outcome. |
| 1P | First Party | Used in reporting to indicate first-party advertiser or owned-side revenue scope. |
| Penetration Rate | N/A | The share of an eligible base that has adopted a feature, entered a status, or reached a target condition. |

## How to read the metrics

**Question 1: Do we have enough creators going LIVE and generating leads?**

- Look at **Supply** metrics.
- These tell you how many creators are active and how many reach meaningful lead thresholds.

**Question 2: Is the traffic healthy and safe?**

- Look at **Ecological** metrics.
- These show certification readiness, recommendation health, and policy risk.

**Question 3: Are viewers turning into leads?**

- Look at **Conversion** metrics.
- These show whether traffic is becoming actual business opportunity.

**Question 4: Which operation program is moving the funnel?**

- Look at **Progress Update** metrics.
- These show whether boosts, reposts, campaigns, community, and education are producing results.

## North Star

<p class="definition">North Star metrics tell you whether the business is creating real user value at scale, not just short-term activity.</p>

### Leads Consumption Duration

- **What it measures:** The average amount of time DAU spends watching lead-generation LIVE content or lead-generation creators' content. In simple terms, it asks: **how much user attention is lead-gen content winning every day?**
- **How to interpret it:** A **higher** number usually means the content is more engaging, more watchable, and more able to earn stable traffic. A **lower** number usually means the content is less attractive, less sticky, or not reaching the right audience.
- **Why it matters:** This is the closest metric to long-term business health because lead generation only scales when users are willing to stay and watch. If watch time is weak, lead volume is usually hard to sustain.

## Supply

<p class="definition">Supply metrics answer one basic question: how many creators are actually producing lead-gen inventory? Without supply, there is nothing to convert.</p>

### Leads Host UV

- **What it measures:** The number of unique creators/hosts in the period who are producing lead-gen LIVE supply. In many business dashboards, this effectively means hosts who generated leads or hosts counted as lead-gen LIVE creators in the selected period.
- **How to interpret it:** A **higher** number means the creator base is broader and the business is less dependent on a few hosts. A **lower** number means supply is concentrated and growth is fragile.
- **Why it matters:** Leads volume becomes much more stable when more hosts can generate leads, because the business is no longer carried by only a few creators.

### Leads Creator UV (Weekly Leads ≥ 5)

- **What it measures:** The number of unique creators whose **weekly leads are at least 5**. This is a "meaningful creator" threshold: not just trying LIVE, but generating repeatable lead output.
- **How to interpret it:** A **higher** number means more creators are graduating from basic participation into meaningful lead generation. A **lower** number means creators may be going LIVE, but many still cannot convert traffic into leads.
- **Why it matters:** This is often a better operating metric than raw go-LIVE volume because it measures **useful supply**, not just activity.

### Leads Creator UV (Weekly Leads ≥ 50)

- **What it measures:** The number of unique creators whose **weekly leads are at least 50**. This is a high-performance creator threshold and usually points to creators with strong content, traffic, and conversion ability.
- **Why it matters:** High-output creators usually drive outsized lead volume, provide showcase cases, and help prove that the operating model works.

### Feature Penetration Rate

- **What it measures:** The percentage of Go LIVE UVs who have the lead-gen feature enabled. It is calculated as **feature Go LIVE UV ÷ total Go LIVE UV**.
- **How to interpret it:** A **higher** rate means more live hosts are actively using the lead generation feature. A **rising** rate usually signals strong product adoption and smoother onboarding, while a **falling** rate may suggest friction in setup, feature understanding, or feature usage.
- **Why it matters:** This shows how deeply the feature is embedded in the live ecosystem and is a key health indicator for the leads program. If overall Go LIVE supply grows but penetration stays low, the leads program may still struggle to scale.

## Ecological

<p class="definition">Ecological metrics tell you whether growth is healthy, compliant, and sustainable. Fast growth with bad ecology usually does not last.</p>

### KYC Certified Rate (50+ Leads UV)

- **What it measures:** The share of creators with **50+ leads** who have completed **KYC (Know Your Customer) individual identity verification**.
- **How to interpret it:** A **higher** rate means more high-potential creators are formally verified and ready for more stable operations support. A **lower** rate means strong creators still have readiness or compliance gaps.

### KYB Certified Rate

- **What it measures:** The share of relevant creators who have completed **KYB (Know Your Business)** or business/industry verification.
- **Why it matters:** For service and lead-gen scenarios, trust is part of conversion. Business verification can improve credibility, reduce friction, and support better-quality lead collection.

### NR Ratio

- **What it measures:** The share of LIVE rooms or LIVE duration that falls into **NR (Not Recommended)** status. NR means the room is **not proactively recommended** in public recommendation surfaces, so traffic is restricted, but it is **not the same as a full ban**.
- **How to interpret it:** A **higher** NR ratio is bad: it means more traffic is being suppressed. A **lower** NR ratio is better: it means more content remains recommendable and can compete for public traffic.
- **Why it matters:** Even strong creators cannot scale if rooms are not recommended. NR directly reduces discoverability, top-of-funnel traffic, and eventually leads.

### Top Creator NR Ratio

- **What it measures:** The NR ratio specifically for **top creators / head creators**.
- **Why it matters:** If top creators are NR-heavy, the business loses both immediate volume and showcase quality.

### Banning Ratio

- **What it measures:** The share of creators or LIVE rooms that were **banned / interrupted / suspended** in the measured period. In practice, this is more severe than NR.
- **How to interpret it:** A **higher** banning ratio signals serious policy or safety problems. A **lower** banning ratio means the ecosystem is more compliant and more stable.

### Leads Host NR Duration Rate

- **What it measures:** The share of total LIVE duration from lead-gen hosts that was spent in **NR status**. In simple terms: **how much of lead-gen creators' streaming time was traffic-suppressed?**
- **Why it matters:** This is often more useful than just counting NR rooms, because it shows the **actual time impact** of recommendation suppression on supply.

## Conversion

<p class="definition">Conversion metrics show whether watch traffic is turning into real business opportunity. This is where "attention" becomes "value."</p>

### Leads Number

- **What it measures:** The total number of leads collected on an average day. It is the most direct output metric for the lead-gen business.
- **Why it matters:** This is the headline business output. Most other metrics matter because they eventually influence this one.

### Leads Number / Leads Host UV

- **What it measures:** The average number of leads generated **per active lead host**. Usually, this is understood as **Leads Number ÷ Leads Host UV**.
- **How to interpret it:** A **higher** number means each host is more productive. A **lower** number means hosts may be active, but many are generating only limited results.
- **Why it matters:** This helps distinguish between **growth from more creators** and **growth from better creator productivity**.

### Leads User Conversion Rate

- **What it measures:** The share of viewers who watched lead-gen LIVE content and then actually submitted contact information / became leads.
- **How to interpret it:** A **higher** rate means the content and lead capture path are persuasive and efficient. A **lower** rate means traffic may be coming in, but the pitch, trust, or collection flow is not strong enough.
- **Why it matters:** This tells you whether the business is merely attracting viewers or actually converting them into usable demand.

## Progress Update Metrics

<p class="definition">These metrics help operators understand whether a specific growth action is moving the funnel. They are more tactical than North Star metrics, but they are critical for daily decision-making.</p>

### Live Boost

- **Impressions:** The total number of times boosted LIVE sessions were shown to users.
- **UVs:** The number of unique users reached by boosted LIVE sessions.

### Creator Repost

- **VV (Video Views):** The total video views on promotional repost videos published by creators.
- **Completion Rate (e.g. 12/10 = 120%):** The share of repost output delivered versus plan, usually calculated as **actual completed reposts ÷ target reposts**. For example, 12 completed against a goal of 10 equals 120%.

### Creator Co-Live

- **Impression PVs:** The total number of impressions generated by the co-live session. A **higher** number means better distribution and stronger top-of-funnel awareness for the collaboration.
- **Watch UVs:** The number of unique users who actually entered and watched the co-live session.
- **Leads Collected:** The number of leads submitted during or directly from the co-live session.

### Campaign Funnel

These metrics usually form a campaign funnel: **Selected → Exposed → Signed up → Went LIVE → Qualified → Redeemed**. In some dashboards, the denominator may use the immediately previous step; in others, it may use the full selected pool.

- **Selected UV:** The number of unique creators selected into the campaign target pool.
- **Exposure Rate:** The share of selected creators who actually saw the campaign exposure. A common interpretation is **exposed UV ÷ selected UV**.
- **Sign-up Rate:** The share of exposed creators who signed up for the campaign. A common interpretation is **registrations ÷ exposed UV**.
- **Go-LIVE Rate:** The share of signed-up creators who actually went LIVE during the campaign window. Commonly understood as **go-LIVE creators ÷ registered creators**.
- **Qualification Rate:** The share of participating creators who met the campaign task threshold, such as leads target, live days target, or mission rules.
- **Redemption Rate:** The share of qualified creators who completed reward claim / verification / redemption. A common interpretation is **redeemed users ÷ qualified users**.

### Community Metrics

- **Community Size:** The total number of creators currently in the community group. Community size is the base for repeated education, activation, and retention.
- **Verified Creators:** The number of creators in the community who have completed the required verification or are recognized by the team as verified / trackable for operations.
- **Creators with ≥ 1 lead:** The number of creators who generated their **first lead** or at least one lead in the measured period.
- **Meaningful Creators (≥ 5 leads):** The number of creators generating **at least 5 leads** in the measured period. This is the community version of a meaningful performance threshold.
- **Engaged Creators (≥ 3 posts/week):** The number of creators who actively post or communicate in the community **at least 3 times per week**.
- **Total Messages Sent:** The total number of messages sent in the community during the period.

### Education Metrics

**Outreach Coverage**

- **What it measures:** The number of creators reached by education content, such as H5 education pages, push messages, notices, webinars, or training materials.
- **Why it matters:** Education cannot drive behavior change if creators never see it. Reach is the first step of the education funnel.

**Open Rate**

- **What it measures:** The share of reached users who actually opened the education content or message.

## Expanded Glossary

### Additional performance and efficiency metrics

- **Managed Creators 5+ Leads / 10+ Leads:** The number of managed creators who generated at least 5 or at least 10 leads in the past 7 days. Useful for tracking whether managed supply is producing stable weekly output.
- **Lead Concentration:** The percentage of total leads contributed by the top 1, top 10, or top 50 creators. Helps judge whether lead volume is diversified or over-concentrated in a few creators.
- **ACU (Average Concurrent Users):** The average number of viewers watching a LIVE room at the same time during a session. A core signal for room strength and a common qualification bar for creator tiering.
- **Broke Zero:** Creators who had zero leads in the recent past but generated their first lead during the current campaign or period. Important for measuring 0→1 activation, not just scale.
- **Leads per 1,000 Watch Minutes:** An efficiency metric showing how many leads are generated for every 1,000 minutes of watch time. Useful when total traffic is changing and you want a normalized conversion-efficiency view.
- **Go LIVE Day Buckets:** A participation breakdown that groups creators by how many days they went LIVE during a campaign, such as 1–4 days or 5–12 days. Shows whether results are coming from light participation or sustained activity.
- **Lead-to-Sale Rate:** The percentage of collected leads that eventually convert into an actual paid sale, course, or service purchase. Connects lead generation with monetization quality.
- **Valid Lead:** A lead counted as valid, typically one unique DM sender or one form submitter who becomes a potential client. Very important because some campaign tasks and scoreboards count only valid leads.
- **Leaderboard Score:** A campaign scoring method that can assign different weights to leads, unique comments, and watch duration. Useful when campaign success is ranked by composite score rather than pure lead count.

### Product, creator workflow, and monetization terms

- **CRM Integration:** The process of syncing lead data into an external CRM or business workflow tool, often through connectors such as Zapier. Useful for explaining how leads become operationally usable after collection.
- **Video Courses:** A paid-content feature that lets creators monetize knowledge through course-style digital products. Appears in education and monetization materials as a downstream conversion outcome.
- **Lead Magnet:** A low-cost or free offer used to collect contact information and start the conversion journey. Explains why some creators optimize for lead volume first rather than immediate high-ticket sales.
- **Front-End Offer:** An entry-level paid product used after the lead magnet to convert users into first-time paying customers. Useful when interpreting monetization models behind lead generation.
- **Back-End Offer:** A higher-ticket or deeper service offer sold after trust and qualification have already been established. Helps explain why some creators can turn the same number of leads into very different revenue.
- **Done For You (DFY):** A service model where the creator or team directly delivers work for the client rather than only teaching or consulting. Frequently appears in creator revenue outcome descriptions.

### Campaign, activation, and community terms

- **Pre-Live / Live Event / Post-Live:** A 3-phase campaign structure covering warm-up, event-day execution, and follow-up retention or conversion. Useful when interpreting campaign tasks that happen before or after the main stream.
- **Registered:** Creators who signed up or opted into the campaign before actual participation. This is not the same as actually participating or going LIVE.
- **Participation:** Creators who actually took part in the campaign after registration. Separates shallow sign-up from real engagement.
- **Go LIVE UV:** The number of unique creators who actually went LIVE within the measured campaign or time window. Often the most important action metric after registration.
- **Qualified Creator:** A creator who meets the campaign's required threshold, such as a lead target, ACU bar, or live-days condition. Qualification is usually a quality filter, not just an attendance marker.
- **Redeemed Creator:** A creator who completed reward verification or benefit claim after qualifying. Important for understanding whether incentives truly closed the loop.
- **High ACU Unmanaged Creators:** Creators with strong concurrent-viewer performance but no assigned manager yet. Often used as a pipeline signal for future management or incubation.

### Ecology, access, and policy-risk terms

- **NR (Not Recommended):** A restriction where a LIVE room is not proactively recommended in public traffic surfaces. NR reduces reach, but it is still different from a full ban.
- **LIVE Interrupt:** A penalty where an ongoing live stream is stopped before the creator chooses to end it. More severe than simple recommendation suppression.
- **LIVE Permission Ban:** A restriction that prevents the creator account from starting any new LIVE sessions. This directly destroys future supply until the restriction is lifted.
- **Gift Ban:** A restriction that blocks the creator from receiving gifts during LIVE. Important when reading monetization-related health signals.
- **RC (Reproduced Content):** Non-original, replayed, or recorded material presented as a LIVE stream. RC often triggers NR or stronger penalties, so it matters for ecology health.
- **RBA (Registered Business Account):** A registered business account state that can follow KYB verification and improve business eligibility for LIVE operations. Useful in business-vertical creator onboarding and compliance conversations.

### Ads, funnel-optimization, and reporting terms

- **DFO (Deep Funnel Optimization):** An optimization approach that evaluates campaign quality deeper in the funnel than top-level lead volume alone. Relevant when the team links lead generation to higher-quality downstream outcomes.
- **Deep Funnel Result:** The core downstream result used by a DFO campaign as its optimization target. Useful when lead count alone is not enough to measure quality.
- **Cost per Deep Funnel Result:** The spend required to generate one deep-funnel result. Helps compare efficiency, not just total result count.
- **Deep Funnel Result Rate:** The share of traffic or leads that reach the defined deep-funnel outcome. Useful for measuring quality progression through the funnel.
- **DFO Positive Rate:** The share of tested DFO campaigns that achieved a positive target outcome in experiment readouts. Helps evaluate whether the optimization approach works at scale.
- **DFO Penetration Rate:** The share of relevant revenue that comes from campaigns already using deep-funnel optimization. Shows adoption level, not just experiment success.
- **Revenue Penetration Rate:** The revenue share from accounts actively using lead-management capabilities such as status updates, assignee, or stage management. Useful when adoption of operations tools matters as much as top-line revenue.
- **Messaging Ads Revenue:** Revenue generated from messaging-based ad products under the relevant reporting scope.
- **Pre-NCA Funnel:** A reporting view that maps user progress before forming a New Customer Acquisition outcome. Useful in lead-management and growth-project reporting.
- **NCA (New Customer Acquisition):** A downstream growth outcome representing the acquisition of new customers. Shows how lead generation may connect to broader business-growth KPIs.

## Metric-reading caveats

1. **Denominator first.** If two dashboards both show a "conversion rate," do not assume the formulas match. Some use the immediately previous funnel step, while others use the full selected or exposed pool.
2. **Activity is not quality.** More registrations, more Go LIVE UV, or more community messages do not automatically mean better business quality. Always pair activity metrics with meaningful creator counts, qualification rates, or lead efficiency.
3. **NR is not the same as ban.** NR means traffic suppression, while interrupt / permission ban is more severe. Both hurt results, but they are not interchangeable.
4. **Creator-visible vs operator-only metrics.** Some metrics such as impressions, recommendation health, or certain CTR-style signals may be CM-side metrics rather than creator-side metrics.
5. **Threshold metrics are stage markers.** Weekly 1+, 5+, 10+, or 50+ lead thresholds are not random. They are usually used to mark activation, meaningful output, qualification, or showcase-level performance.
6. **Older dashboard names may change.** Legacy dashboard references may become outdated over time, so validate the current data source if a dashboard name looks old.

## Quick Summary

| If you want to know… | Look at… |
| --- | --- |
| Whether lead-gen content is creating real user value | Leads Consumption Duration |
| Whether enough creators are supplying lead-gen LIVE | Leads Host UV, Weekly Leads ≥ 5 UV, Weekly Leads ≥ 50 UV |
| Whether the ecosystem is healthy and recommendation-safe | KYC / KYB, NR Ratio, Top Creator NR Ratio, Banning Ratio, NR Duration Rate |
| Whether traffic becomes actual leads | Leads Number, Leads per Host, Leads User Conversion Rate |
| Whether a program or campaign is working | Boost, Repost, Co-Live, Campaign funnel, Community, Education metrics |
