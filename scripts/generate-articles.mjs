import fs from 'node:fs';
import path from 'node:path';

const dir = 'src/content/articles';
fs.mkdirSync(dir, { recursive: true });

// Category defaults — must be real pickleball imagery (not tennis/badminton/running/cycling stock).
const hero = {
	paddles: [
		'https://images.unsplash.com/photo-1762423570127-c36ff11b883f?w=1200&q=80&auto=format&fit=crop',
		'Player holding a pickleball paddle on an outdoor court',
	],
	shoes: [
		'https://images.unsplash.com/photo-1767627042725-865125616a98?w=1200&q=80&auto=format&fit=crop',
		'Court shoes on a blue and green outdoor hard court',
	],
	nets: [
		'https://images.unsplash.com/photo-1779209219762-681ff11296d6?w=1200&q=80&auto=format&fit=crop',
		'Outdoor pickleball court with a regulation-style net',
	],
	guides: [
		'https://images.unsplash.com/photo-1747027694225-cbf12dd20826?w=1200&q=80&auto=format&fit=crop',
		'Players rallying with pickleball paddles on an outdoor court',
	],
	rules: [
		'https://images.unsplash.com/photo-1761644658016-324918bc373c?w=1200&q=80&auto=format&fit=crop',
		'Players competing with paddles and a yellow pickleball on a blue court',
	],
};

function fm(o) {
	const faq = o.faq
		.map((f) => `  - question: ${JSON.stringify(f.q)}\n    answer: ${JSON.stringify(f.a)}`)
		.join('\n');
	return `---
title: ${JSON.stringify(o.title)}
description: ${JSON.stringify(o.description)}
slug: ${JSON.stringify(o.slug)}
category: ${o.category}
type: ${o.type}
author: "ThePickleballCourt.ca Editorial Team"
publishDate: 2026-07-01
updatedDate: 2026-07-25
heroImage: ${JSON.stringify(hero[o.category][0])}
heroAlt: ${JSON.stringify(hero[o.category][1])}
featured: ${o.featured ? 'true' : 'false'}
relatedProducts:
${o.products.map((p) => `  - ${p}`).join('\n')}
tags:
${o.tags.map((t) => `  - ${t}`).join('\n')}
faq:
${faq}
---
`;
}

const articles = [
	{
		slug: 'how-to-choose-a-pickleball-paddle',
		title: "How to Choose a Pickleball Paddle: The Complete Beginner's Guide",
		description:
			'Learn weight, grip, core thickness, face materials, and shapes so you can buy your first or next pickleball paddle with confidence.',
		category: 'paddles',
		type: 'buying-guide',
		featured: true,
		products: ['joola-vision-c15', 'selkirk-slk-halo-control-xl', 'joola-hyperion-cas-16', 'six-zero-ruby-16mm'],
		tags: ['beginners', 'paddles', 'buying-guide', 'pillar'],
		faq: [
			{ q: 'What paddle weight should beginners buy?', a: 'Most beginners do well with a midweight paddle that balances power and control. If your arm fatigues quickly, go lighter before chasing pop.' },
			{ q: 'Is a more expensive paddle always better?', a: 'No. A forgiving control paddle often helps new players more than a stiff power frame designed for advanced drivers.' },
			{ q: 'Should I buy fiberglass or carbon fiber first?', a: 'Accessible entry carbon or fiberglass-feeling paddles are fine to start. Raw carbon shines once you can consistently generate brush contact.' },
			{ q: 'What grip size do I need?', a: 'Choose a grip that lets your fingers wrap comfortably without straining. Many players start mid-size and add an overgrip.' },
			{ q: 'Where should Canadians buy paddles?', a: 'Amazon.ca is convenient for shipping and returns. Always confirm the current price and seller before checkout.' },
		],
		body: `If you are staring at a wall of paddles and feeling lost, you are not alone. Choosing a pickleball paddle is less about chasing a pro setup and more about matching the paddle to how you actually play.

This pillar guide covers weight, balance, grip, core thickness, face material, and shape. We point to real products in our [paddle catalog](/gear/paddles) and deeper guides like [best paddles for beginners](/guides/best-pickleball-paddles-for-beginners) and [JOOLA vs Selkirk vs Six Zero](/guides/joola-vs-selkirk-vs-six-zero).

<Callout type="tip" title="Start here if you are overwhelmed">
Buy for forgiveness and comfort first. Power paddles are easier to grow into once your contact point is consistent.
</Callout>

## The five specs that actually matter

### 1. Weight and swing weight
Static weight is the number on the sheet; swing weight is how heavy it feels when you accelerate. Beginners usually want a paddle that does not punish late preparation. If your elbow complains after two games, go lighter before blaming your technique for everything.

### 2. Grip size and handle length
A grip that is too large kills wrist action. Too small and you over-squeeze. Elongated handles help two-handed backhands; standard handles suit classic doubles blocking patterns.

### 3. Core thickness
Thicker cores around 16mm generally offer more dwell and control. Thinner cores can feel poppier. For Canadian outdoor play — where the ball can skid in cold weather — a 16mm control-oriented paddle is a safer first buy for most recreational players.

### 4. Face material
Fiberglass faces often feel trampoline-like. Carbon faces reward brush contact with spin. Read [carbon fiber vs fiberglass](/guides/carbon-fiber-vs-fiberglass-paddles) before you overspend on a spin paddle you are not ready to use.

### 5. Shape
Widebody shapes enlarge the sweet spot. Elongated shapes add reach for singles and drive-heavy doubles. Exciting? Yes. Forgiving off-center? Less so.

## A simple buying framework

1. **Where do I play?** Indoor gyms and outdoor acrylic play differently.
2. **What is my identity for the next year?** Dinker, driver, or all-court — be honest.
3. **What is my budget band?** Use price tiers, not obsession over a sticker number.

## Recommended starting points from our catalog

These are catalog references, not live checkout prices. Always confirm on Amazon.ca.

- **Budget-friendly entry:** JOOLA Vision C15
- **Control-first value:** Selkirk SLK Halo Control XL
- **Spin-oriented upgrade:** JOOLA Hyperion CAS 16
- **Modern all-court thermoform:** Six Zero Ruby 16mm

<ComparisonTable productIds={["joola-vision-c15","selkirk-slk-halo-control-xl","joola-hyperion-cas-16","six-zero-ruby-16mm"]} caption="Beginner-to-intermediate paddle shortlist" />

<ProsCons
  pros={["Clearer contact once weight and grip fit","Faster improvement with a matching sweet spot","Less arm fatigue across club nights"]}
  cons={["Buying pure power too early wrecks consistency","Marketing buzzwords are not automatic upgrades","Amazon listings change — verify the exact model"]}
/>

## Common beginner mistakes

Copying a pro paddle, ignoring shoes, and chasing spin before clean contact are the big three. Pair this guide with [court shoes](/guides/best-pickleball-shoes-2026) and [pickleball rules for beginners](/guides/pickleball-rules-for-beginners).

## Demo plan for online buyers

Shortlist two or three paddles in the same weight class, check Amazon.ca return windows, then play three sessions: soft game, driving night, and tired-legs night. Keep the paddle that stays comfortable when you are late to the ball.

## Next reads

- [Best Pickleball Paddles (2026)](/guides/best-pickleball-paddles-2026)
- [Best paddles for control](/guides/best-pickleball-paddles-for-control), [power](/guides/best-pickleball-paddles-for-power), and [spin](/guides/best-pickleball-paddles-for-spin)
- Browse the [paddles hub](/gear/paddles)

<Callout type="pick" title="Practical starter stack">
Pair a forgiving paddle (Halo Control XL or Vision C15) with real court shoes. Gear that matches your week beats gear that matches Instagram.
</Callout>
`,
	},
	{
		slug: 'best-pickleball-paddles-2026',
		title: 'Best Pickleball Paddles (2026): Tested Picks for Every Level',
		description:
			'Our 2026 shortlist of JOOLA, Selkirk, and Six Zero paddles for beginners, control players, power hitters, and spin specialists in Canada.',
		category: 'paddles',
		type: 'buying-guide',
		featured: true,
		products: [
			'joola-perseus-16mm',
			'selkirk-luxx-control-air-epic',
			'six-zero-double-black-diamond-control',
			'joola-ben-johns-hyperion-c2',
			'selkirk-vanguard-power-air-invikta',
			'joola-vision-c15',
		],
		tags: ['paddles', 'best-of', '2026'],
		faq: [
			{ q: 'What is the best pickleball paddle overall in 2026?', a: 'There is no universal winner. Choose by playing style: control, power, spin, or all-court.' },
			{ q: 'Best value paddle in our catalog?', a: 'JOOLA Vision C15 and Selkirk SLK Halo Control XL are strong value starting points before flagship pricing.' },
			{ q: 'Do I need a thermoformed paddle?', a: 'Not at first. Construction buzzwords matter less than weight fit and consistent contact.' },
			{ q: 'Which paddle for mixed doubles?', a: 'Balanced 16mm frames like Hyperion C2 or Ruby-class paddles suit most mixed doubles patterns.' },
			{ q: 'Are listed prices live Amazon prices?', a: 'No. They are approximate catalog references. Always check the current price on Amazon.ca.' },
		],
		body: `"Best paddle" lists fail when they crown one winner for everyone. This 2026 guide organizes picks by player job using only products in our [paddle catalog](/gear/paddles).

New to the sport? Start with [how to choose a paddle](/guides/how-to-choose-a-pickleball-paddle).

## Quick picks

- **Beginner:** JOOLA Vision C15 or Selkirk SLK Halo Control XL
- **Control:** Selkirk LUXX Control Air Epic
- **Spin:** Six Zero Double Black Diamond Control / JOOLA Hyperion CAS 16
- **Power:** JOOLA Perseus 16mm / Selkirk VANGUARD Power Air Invikta
- **All-court:** JOOLA Ben Johns Hyperion C2

<ComparisonTable productIds={["selkirk-luxx-control-air-epic","six-zero-double-black-diamond-control","joola-perseus-16mm","joola-ben-johns-hyperion-c2","selkirk-vanguard-power-air-invikta"]} />

## Best for control
LUXX Control Air Epic is for soft hands: dinks, drops, and absorbing pace. Deep dive: [best paddles for control](/guides/best-pickleball-paddles-for-control).

## Best for spin
Raw carbon faces reward players who roll the ball. See [best paddles for spin](/guides/best-pickleball-paddles-for-spin).

## Best for power
Perseus and Power Air Invikta serve aggressive players with early preparation. If you spray long, fix contact before buying pop — or read [power paddles](/guides/best-pickleball-paddles-for-power).

## Best all-court compromise
Hyperion C2 remains a high-intent Canadian search because it blends reach, feedback, and a usable sweet spot for mixed club nights.

<ProsCons
  pros={["Shortlist by playing style","Value and flagship options","Tied to Amazon.ca availability"]}
  cons={["No universal number one","Models and listings change","Approximate catalog prices only"]}
/>

## How we chose
We mapped catalog features to court jobs and avoided inventing lab numbers we do not have. Pair any upgrade with [court shoes](/guides/best-pickleball-shoes-2026) and compare brands in [JOOLA vs Selkirk vs Six Zero](/guides/joola-vs-selkirk-vs-six-zero).

<Callout type="warning" title="Price reminder">
Never treat on-site prices as checkout truth. Use Check current price on Amazon on every product.
</Callout>
`,
	},
];

// Remaining articles defined compactly with shared body builders
function faq5(pairs) {
	return pairs.map(([q, a]) => ({ q, a }));
}

const rest = [
	{
		slug: 'best-pickleball-shoes-2026',
		title: 'Best Pickleball Shoes (2026): Court Shoes That Protect Your Joints',
		description: 'Compare Skechers and ASICS pickleball court shoes for Canadian hard courts, lateral support, and joint-friendly cushioning.',
		category: 'shoes', type: 'buying-guide', featured: true,
		products: ['skechers-viper-court-pro', 'skechers-viper-court-shoe', 'asics-gel-dedicate-8', 'asics-gel-resolution-9'],
		tags: ['shoes', 'best-of', '2026', 'joints'],
		faq: faq5([
			['Can I play pickleball in running shoes?', 'You can, but you should not as a habit. Running shoes are built for forward stride; pickleball demands lateral stability.'],
			['Skechers or ASICS for beginners?', 'Skechers Viper Court models are popular comfort-first court shoes; ASICS Gel-Dedicate offers familiar court stability at a friendlier tier.'],
			['What shoe helps bad knees?', 'Look for cushioning plus lateral support — and consider our plantar fasciitis / bad knees guide. Shoes help; they are not medical treatment.'],
			['Do I need pickleball-specific shoes?', 'Court shoes (tennis/pickleball) with gum or court rubber outsoles are the real requirement.'],
			['Are prices live?', 'No. Confirm current price on Amazon.ca.'],
		]),
		links: ['/guides/skechers-vs-asics-pickleball', '/guides/best-pickleball-shoes-for-wide-feet', '/guides/best-pickleball-shoes-for-plantar-fasciitis', '/gear/shoes'],
		compare: ['skechers-viper-court-pro', 'skechers-viper-court-shoe', 'asics-gel-dedicate-8', 'asics-gel-resolution-9'],
		sections: [
			['Why court shoes matter', 'Pickleball is a lateral sport. Plant, cut, stop at the kitchen, recover for an overhead. Running shoes flex in ways that leave your ankle and knee doing extra work. On Canadian outdoor acrylic, durable outsoles also matter because grit eats soft rubber.'],
			['Best comfort-first: Skechers Viper Court line', 'Viper Court and Viper Court Pro are high-intent Canadian searches for players who want court traction without a stiff tennis-shoe break-in. Pro models typically aim at more serious lateral play; the standard Viper Court remains a strong recreational value.'],
			['Best stability-first: ASICS court lineup', 'Gel-Dedicate 8 is the budget-friendly ASICS on-ramp. Gel-Resolution 9 is the premium lockdown option for competitive players who load the outside edge hard. See [Skechers vs ASICS](/guides/skechers-vs-asics-pickleball).'],
			['Fit checklist', 'Leave a thumb of toe room, lock the heel, and test a hard lateral step in the store aisle or your hallway before first match use. Wide feet? Read [shoes for wide feet](/guides/best-pickleball-shoes-for-wide-feet).'],
		],
	},
	{
		slug: 'best-portable-pickleball-nets-2026',
		title: 'Best Portable Pickleball Nets (2026)',
		description: 'Compare Franklin, ONIX, Rally, and Selkirk portable pickleball nets for Canadian driveways, parks, and cottage courts.',
		category: 'nets', type: 'buying-guide', featured: true,
		products: ['franklin-signature-portable-net', 'onix-portable-pickleball-net', 'rally-portable-net-set', 'selkirk-portable-net-system'],
		tags: ['nets', 'best-of', '2026', 'portable'],
		faq: faq5([
			['What height should a pickleball net be?', 'Regulation nets are 36 inches at the sidelines and 34 inches at the center. Confirm your model holds center height under tension.'],
			['Best net for a driveway?', 'Franklin and Rally systems are popular for quick home setups; prioritize stability in wind and easy teardown.'],
			['Do portable nets work for tournaments?', 'Some premium systems are training/tournament adjacent, but always check event equipment rules.'],
			['How important is the carrying case?', 'If you move the net weekly, a wheeled or well-padded case saves frustration and frame dings.'],
			['Are prices live?', 'No. Check current price on Amazon.ca.'],
		]),
		links: ['/guides/franklin-vs-onix-vs-rally-vs-selkirk-nets', '/guides/pickleball-court-dimensions', '/gear/nets'],
		compare: ['franklin-signature-portable-net', 'onix-portable-pickleball-net', 'rally-portable-net-set', 'selkirk-portable-net-system'],
		sections: [
			['What makes a portable net worth buying', 'Fast setup, regulation dimensions, center strap tension, and a frame that does not collapse when a ball hammers the tape. Canadian cottage and park players also care about packed size and weather exposure.'],
			['Franklin Signature Pro', 'A top-searched home-court option for families and HOA driveways. Strong default if you want regulation size without a permanent install.'],
			['ONIX portable system', 'Favoured when you want premium tension and a travel-ready case for clubs or coaching.'],
			['Rally deluxe', 'Practical for cottages and multi-use spaces where tool-free setup matters.'],
			['Selkirk premium portable', 'A natural match if you already trust Selkirk paddles and want a higher-end home court feel.'],
		],
	},
	{
		slug: 'joola-vs-selkirk-vs-six-zero',
		title: 'JOOLA vs Selkirk vs Six Zero: Which Paddle Brand Is Right for You?',
		description: 'Compare JOOLA, Selkirk, and Six Zero pickleball paddle brands by feel, player fit, and popular Canadian catalog models.',
		category: 'paddles', type: 'comparison', featured: true,
		products: ['joola-hyperion-cas-16', 'selkirk-luxx-control-air-epic', 'six-zero-double-black-diamond-control', 'joola-perseus-16mm', 'selkirk-slk-halo-control-xl'],
		tags: ['comparison', 'joola', 'selkirk', 'six-zero'],
		faq: faq5([
			['Is JOOLA better than Selkirk?', 'Neither is universally better. JOOLA often appeals to players chasing modern power/spin shapes; Selkirk spans value control to premium soft-game frames.'],
			['Who should buy Six Zero?', 'Players who want raw carbon spin feel and are willing to learn brush technique.'],
			['Best brand for beginners?', 'Selkirk SLK Halo Control XL and JOOLA Vision C15 are approachable catalog starting points.'],
			['Do brands play the same across models?', 'No. Model geometry matters more than logo.'],
			['Where to compare prices?', 'Use Amazon.ca links in our [paddle hub](/gear/paddles) and confirm current pricing.'],
		]),
		links: ['/guides/best-pickleball-paddles-2026', '/guides/how-to-choose-a-pickleball-paddle', '/gear/paddles'],
		compare: ['joola-hyperion-cas-16', 'selkirk-luxx-control-air-epic', 'six-zero-double-black-diamond-control'],
		sections: [
			['JOOLA in one paragraph', 'JOOLA models in our catalog — Perseus, Hyperion CAS/C2, Vision — skew toward competitive shapes, carbon surfaces, and players who already hit with intent. Great when you want a modern all-court or power identity.'],
			['Selkirk in one paragraph', 'Selkirk covers a wide ladder: SLK Halo Control XL for value forgiveness, LUXX Control Air Epic for premium soft game, and VANGUARD Power Air Invikta for elongated power. Ideal if you want a clear control-to-power path inside one brand family.'],
			['Six Zero in one paragraph', 'Six Zero’s Double Black Diamond Control and Ruby speak to players hunting grit and thermoformed modern construction. If spin and dwell are your love language, start here — after you can already dink without popping everything up.'],
			['How to decide', 'Pick the brand that sells the model matching your job, not the brand with the loudest sponsorship reel. Then validate weight and grip on court.'],
		],
	},
	{
		slug: 'skechers-vs-asics-pickleball',
		title: 'Skechers vs ASICS for Pickleball: Which Court Shoe Wins?',
		description: 'A practical Skechers vs ASICS court shoe comparison for pickleball players focused on comfort, stability, and Canadian hard courts.',
		category: 'shoes', type: 'comparison', featured: false,
		products: ['skechers-viper-court-pro', 'skechers-viper-court-shoe', 'asics-gel-dedicate-8', 'asics-gel-resolution-9'],
		tags: ['comparison', 'shoes', 'skechers', 'asics'],
		faq: faq5([
			['Are Skechers good for pickleball?', 'Viper Court models are among the most searched pickleball shoes in Canada for comfort-focused court play.'],
			['Are ASICS better for ankle support?', 'Gel-Resolution especially targets aggressive lateral lockdown. Fit is personal — try heel hold first.'],
			['Which is better for wide feet?', 'See our wide-feet guide; many players report different lasts across brands. Fit beats logo.'],
			['Can either replace a medical insert?', 'No. Shoes complement, not replace, clinician advice for injuries.'],
			['Where to buy in Canada?', 'Amazon.ca links in our [shoe hub](/gear/shoes).'],
		]),
		links: ['/guides/best-pickleball-shoes-2026', '/guides/best-pickleball-shoes-for-wide-feet', '/gear/shoes'],
		compare: ['skechers-viper-court-pro', 'asics-gel-resolution-9', 'asics-gel-dedicate-8', 'skechers-viper-court-shoe'],
		sections: [
			['Comfort lane: Skechers', 'If you want cushioning and an easier break-in for social and intermediate play, Skechers Viper Court / Pro are the default shortlist.'],
			['Stability lane: ASICS', 'If you load the edges hard in competitive doubles, ASICS Gel-Resolution 9 is the premium option; Gel-Dedicate 8 keeps ASICS DNA at a lower tier.'],
			['The honest verdict', 'Skechers often wins comfort-first club nights. ASICS often wins when you prioritize structured lateral support. Your foot shape decides the final call.'],
		],
	},
	{
		slug: 'franklin-vs-onix-vs-rally-vs-selkirk-nets',
		title: 'Franklin vs ONIX vs Rally vs Selkirk: Best Pickleball Net Compared',
		description: 'Side-by-side comparison of Franklin, ONIX, Rally, and Selkirk portable pickleball nets for home and park courts in Canada.',
		category: 'nets', type: 'comparison', featured: false,
		products: ['franklin-signature-portable-net', 'onix-portable-pickleball-net', 'rally-portable-net-set', 'selkirk-portable-net-system'],
		tags: ['comparison', 'nets'],
		faq: faq5([
			['Which net is best for beginners setting up at home?', 'Franklin and Rally are popular driveway/cottage starting points.'],
			['Which net feels most premium?', 'ONIX and Selkirk systems target players wanting higher-end tension and build.'],
			['Will wind tip portable nets?', 'Lighter frames can shift in prairie or coastal wind — stake or weight thoughtfully and never leave unattended in storms.'],
			['Do I need boundary lines too?', 'For practice, chalk or temporary lines help. See court dimensions guide.'],
			['Prices live?', 'No — confirm on Amazon.ca.'],
		]),
		links: ['/guides/best-portable-pickleball-nets-2026', '/guides/pickleball-court-dimensions', '/gear/nets'],
		compare: ['franklin-signature-portable-net', 'onix-portable-pickleball-net', 'rally-portable-net-set', 'selkirk-portable-net-system'],
		sections: [
			['Franklin', 'Best “just get a regulation net up” energy for many Canadian families.'],
			['ONIX', 'Best when transport, case quality, and tension consistency matter for group use.'],
			['Rally', 'Best practical cottage/multi-use pick when setup speed is the bottleneck.'],
			['Selkirk', 'Best brand-aligned premium portable if you want the home court to match a Selkirk paddle bag.'],
		],
	},
	{
		slug: 'carbon-fiber-vs-fiberglass-paddles',
		title: "Carbon Fiber vs Fiberglass Pickleball Paddles: What's the Difference?",
		description: 'Understand carbon fiber vs fiberglass pickleball paddle faces — spin, power, durability feel, and who should buy which.',
		category: 'paddles', type: 'informational', featured: false,
		products: ['six-zero-double-black-diamond-control', 'joola-hyperion-cas-16', 'joola-vision-c15', 'selkirk-slk-halo-control-xl'],
		tags: ['materials', 'carbon', 'fiberglass', 'paddles'],
		faq: faq5([
			['Is carbon fiber always better?', 'No. Better for spin-capable players; not automatically better for beginners.'],
			['Do carbon paddles break easier?', 'Durability depends on full construction, edge guard, and impact habits — not face fiber alone. {{ TODO: confirm }} model-specific durability claims.'],
			['What is raw carbon?', 'A textured carbon surface marketed for grit/spin. Feel varies by model and wear over time.'],
			['Can beginners use carbon?', 'Yes, especially accessible carbon entry paddles — just do not expect magic spin without technique.'],
			['What should I buy first?', 'Forgiving control shape first; materials second. See the beginner paddle guide.'],
		]),
		links: ['/guides/how-to-choose-a-pickleball-paddle', '/guides/best-pickleball-paddles-for-spin', '/gear/paddles'],
		compare: ['six-zero-double-black-diamond-control', 'joola-hyperion-cas-16', 'joola-vision-c15'],
		sections: [
			['Fiberglass feel', 'Often springier and easier for recreational pop. Helpful when you need help generating ball speed.'],
			['Carbon feel', 'Usually firmer feedback with more potential bite for topspin and sidespin when you brush correctly.'],
			['Practical recommendation', 'Beginners: prioritize sweet spot and weight. Intermediates ready to shape the ball: carbon or CAS-style surfaces in our catalog. Advanced spin players: raw carbon options like Double Black Diamond Control.'],
		],
	},
	{
		slug: 'best-pickleball-paddles-for-beginners',
		title: 'Best Pickleball Paddles for Beginners',
		description: 'Forgiving, confidence-building pickleball paddles for new Canadian players — with catalog picks and a clear buying checklist.',
		category: 'paddles', type: 'buying-guide', featured: false,
		products: ['joola-vision-c15', 'selkirk-slk-halo-control-xl', 'six-zero-ruby-16mm'],
		tags: ['beginners', 'paddles'],
		faq: faq5([
			['Should beginners buy a cheap wooden paddle?', 'A modern composite paddle from our beginner shortlist will teach better habits than a toy wooden set.'],
			['Widebody or elongated?', 'Widebody/control shapes are usually kinder while you learn.'],
			['How much should I spend?', 'Stay in a sensible tier; upgrade after you know your style.'],
			['Do I need spin grit day one?', 'No. Consistency first.'],
			['Next gear after a paddle?', 'Court shoes. Seriously.'],
		]),
		links: ['/guides/how-to-choose-a-pickleball-paddle', '/guides/best-pickleball-shoes-2026', '/guides/pickleball-rules-for-beginners', '/gear/paddles'],
		compare: ['joola-vision-c15', 'selkirk-slk-halo-control-xl', 'six-zero-ruby-16mm'],
		sections: [
			['What beginners should optimize', 'Sweet spot size, comfortable grip, midweight feel, and a paddle that does not punish mishits at the kitchen.'],
			['Our beginner shortlist', 'Vision C15 for accessible carbon entry, Halo Control XL for control forgiveness, Ruby 16mm if you want a modern step-up without jumping to pure power.'],
		],
	},
	{
		slug: 'best-pickleball-paddles-for-control',
		title: 'Best Pickleball Paddles for Control',
		description: 'Control-oriented pickleball paddles for soft-game players who win with dinks, drops, and resets.',
		category: 'paddles', type: 'buying-guide', featured: false,
		products: ['selkirk-luxx-control-air-epic', 'selkirk-slk-halo-control-xl', 'six-zero-double-black-diamond-control'],
		tags: ['control', 'paddles'],
		faq: faq5([
			['What makes a paddle “control”?', 'More dwell, a stable soft game response, and less trampoline launch on mishits — though feel is model-specific.'],
			['Can control paddles still attack?', 'Yes. You can speed up; you just start from a softer baseline.'],
			['Best control paddle in catalog?', 'LUXX Control Air Epic is our premium control flagship reference; Halo Control XL is the value control path.'],
			['Is raw carbon control-friendly?', 'Some raw carbon frames are tuned for control plus spin — Double Black Diamond Control is the catalog example.'],
			['Prices live?', 'No.'],
		]),
		links: ['/guides/best-pickleball-paddles-2026', '/guides/best-pickleball-paddles-for-spin', '/gear/paddles'],
		compare: ['selkirk-luxx-control-air-epic', 'selkirk-slk-halo-control-xl', 'six-zero-double-black-diamond-control'],
		sections: [
			['Who this is for', 'Players who beat bangers by getting to the kitchen first and refusing to miss.'],
			['Catalog control ladder', 'Halo Control XL → LUXX Control Air Epic, with Double Black Diamond Control if you also want spin grit.'],
		],
	},
	{
		slug: 'best-pickleball-paddles-for-power',
		title: 'Best Pickleball Paddles for Power',
		description: 'Power-focused pickleball paddles for drivers and put-away artists — plus who should not buy a power frame yet.',
		category: 'paddles', type: 'buying-guide', featured: false,
		products: ['joola-perseus-16mm', 'selkirk-vanguard-power-air-invikta', 'joola-ben-johns-hyperion-c2'],
		tags: ['power', 'paddles'],
		faq: faq5([
			['Will a power paddle fix a weak serve?', 'It can add pop, but timing and contact still rule. Technique first.'],
			['Best power paddle here?', 'Perseus 16mm and VANGUARD Power Air Invikta are the catalog power references.'],
			['Power paddles and tennis elbow', 'Heavier swing feel can aggravate issues. Stop if pain appears and consult a professional.'],
			['Elongated for power?', 'Often yes for reach and leverage — with a smaller effective sweet spot.'],
			['Prices live?', 'No.'],
		]),
		links: ['/guides/best-pickleball-paddles-2026', '/guides/best-pickleball-paddles-for-control', '/gear/paddles'],
		compare: ['joola-perseus-16mm', 'selkirk-vanguard-power-air-invikta', 'joola-ben-johns-hyperion-c2'],
		sections: [
			['Who should buy power', 'Players with clean preparation who already control the kitchen and want put-away confidence.'],
			['Who should wait', 'Anyone still sailing third-shot drops long or missing resets. Get control consistency first.'],
		],
	},
	{
		slug: 'best-pickleball-paddles-for-spin',
		title: 'Best Pickleball Paddles for Spin',
		description: 'Spin-friendly pickleball paddles with carbon surfaces for players who roll, shape, and dip the ball off the bounce.',
		category: 'paddles', type: 'buying-guide', featured: false,
		products: ['six-zero-double-black-diamond-control', 'joola-hyperion-cas-16', 'six-zero-ruby-16mm'],
		tags: ['spin', 'paddles', 'carbon'],
		faq: faq5([
			['Does grit wear off?', 'Surface texture can change with use. {{ TODO: confirm }} wear rates by model.'],
			['Is CAS the same as raw carbon?', 'Different branded surface approaches — both aim to help spin, with model-specific feel.'],
			['Best spin paddle in catalog?', 'Double Black Diamond Control and Hyperion CAS 16 are the primary spin-oriented references.'],
			['Can beginners buy spin paddles?', 'Yes, but learn brush contact; do not expect the paddle to create RPMs alone.'],
			['Prices live?', 'No.'],
		]),
		links: ['/guides/carbon-fiber-vs-fiberglass-paddles', '/guides/best-pickleball-paddles-2026', '/gear/paddles'],
		compare: ['six-zero-double-black-diamond-control', 'joola-hyperion-cas-16', 'six-zero-ruby-16mm'],
		sections: [
			['Spin is a technique multiplier', 'The paddle helps when you already brush low-to-high with a stable contact point.'],
			['Catalog spin shortlist', 'Double Black Diamond Control, Hyperion CAS 16, and Ruby 16mm as a modern all-court spin-capable frame.'],
		],
	},
	{
		slug: 'best-pickleball-shoes-for-wide-feet',
		title: 'Best Pickleball Shoes for Wide Feet',
		description: 'How to choose pickleball court shoes for wide feet, with Skechers and ASICS catalog options and a fit checklist.',
		category: 'shoes', type: 'buying-guide', featured: false,
		products: ['skechers-viper-court-pro', 'skechers-viper-court-shoe', 'asics-gel-dedicate-8', 'asics-gel-resolution-9'],
		tags: ['shoes', 'wide-feet', 'fit'],
		faq: faq5([
			['Do Skechers fit wide?', 'Many players find Skechers court models roomier, but lasts vary by size. {{ TODO: confirm }} official wide-width availability by SKU.'],
			['Do ASICS offer wide court shoes?', '{{ TODO: confirm }} current wide-width ASICS court SKUs on Amazon.ca for your size.'],
			['Should I size up instead of wide?', 'Sometimes length helps, but width issues need width — sizing up can cause heel slip.'],
			['Socks matter?', 'Yes. Thin performance socks beat thick cotton for hot spots.'],
			['Prices live?', 'No.'],
		]),
		links: ['/guides/skechers-vs-asics-pickleball', '/guides/best-pickleball-shoes-2026', '/gear/shoes'],
		compare: ['skechers-viper-court-pro', 'skechers-viper-court-shoe', 'asics-gel-dedicate-8'],
		sections: [
			['Fit > brand story', 'Wide feet need a last that does not crush the fifth metatarsal during lateral loads. Try end-of-day fit checks when feet are slightly swollen.'],
			['Practical shortlist', 'Start with Skechers Viper Court / Pro for comfort-oriented volume, and compare ASICS models if you need more structured lockdown — confirming width options before you buy.'],
		],
	},
	{
		slug: 'best-pickleball-shoes-for-plantar-fasciitis',
		title: 'Best Pickleball Shoes for Plantar Fasciitis / Bad Knees',
		description: 'Court shoe guidance for pickleball players managing plantar fascia irritation or knee stress — comfort, support, and honest limits.',
		category: 'shoes', type: 'buying-guide', featured: false,
		products: ['skechers-viper-court-pro', 'asics-gel-resolution-9', 'asics-gel-dedicate-8', 'skechers-viper-court-shoe'],
		tags: ['shoes', 'plantar-fasciitis', 'knees', 'seniors'],
		faq: faq5([
			['Can shoes cure plantar fasciitis?', 'No. Shoes may reduce irritation; medical diagnosis and rehab plans come from qualified professionals.'],
			['Cushion or stability first?', 'Often both: heel comfort plus lateral control so you do not collapse inward on cuts.'],
			['ASICS Gel helpful?', 'Gel cushioning is a reason many injury-conscious players look at ASICS court shoes.'],
			['Should I stop playing?', 'Pain is information. Rest and professional guidance beat toughing through sharp pain.'],
			['Prices live?', 'No.'],
		]),
		links: ['/guides/best-pickleball-shoes-2026', '/guides/best-pickleball-gear-for-seniors', '/gear/shoes'],
		compare: ['skechers-viper-court-pro', 'asics-gel-resolution-9', 'asics-gel-dedicate-8'],
		sections: [
			['Important disclaimer', 'This is gear guidance, not medical advice. Sharp or persistent pain deserves a clinician, not just a new SKU.'],
			['What to look for', 'Heel cushioning, secure midfoot, court outsole, and a ride that does not slam your joints on outdoor Canadian hard courts.'],
			['Catalog starting points', 'Skechers Viper Court Pro for comfort-forward court cushioning; ASICS Gel-Dedicate / Gel-Resolution when you want structured court support with Gel cushioning heritage.'],
		],
	},
	{
		slug: 'best-pickleball-gear-for-seniors',
		title: 'Best Pickleball Gear for Seniors',
		description: 'Senior-friendly pickleball paddle, shoe, and net recommendations focused on joint comfort, forgiveness, and easy setup.',
		category: 'guides', type: 'buying-guide', featured: true,
		products: ['selkirk-slk-halo-control-xl', 'joola-vision-c15', 'skechers-viper-court-shoe', 'asics-gel-dedicate-8', 'franklin-signature-portable-net'],
		tags: ['seniors', 'beginners', 'joint-friendly'],
		faq: faq5([
			['What paddle weight for seniors?', 'Many prefer lighter-to-midweight forgiving frames to reduce arm fatigue — personal strength varies.'],
			['Best shoe priority?', 'Stability, cushioning, and non-running outsoles.'],
			['Is pickleball safe for seniors?', 'It can be joint-friendlier than some sports, but falls and overuse injuries still happen. Play within your conditioning.'],
			['Portable net tips?', 'Choose a system you can assemble without wrestling — Franklin is a common home pick.'],
			['Prices live?', 'No.'],
		]),
		links: ['/guides/best-pickleball-paddles-for-beginners', '/guides/best-pickleball-shoes-for-plantar-fasciitis', '/guides/pickleball-rules-for-beginners', '/gear/paddles'],
		compare: ['selkirk-slk-halo-control-xl', 'joola-vision-c15', 'skechers-viper-court-shoe', 'asics-gel-dedicate-8'],
		sections: [
			['Paddle priorities', 'Forgiveness over flagship power. Halo Control XL and Vision C15 are sensible catalog starting points.'],
			['Shoe priorities', 'Court shoes that cushion and stabilize — Skechers Viper Court or ASICS Gel-Dedicate — beat running shoes every day.'],
			['Net priorities', 'If you host games at home, a portable net you can set up calmly matters more than premium branding.'],
		],
	},
	{
		slug: 'pickleball-rules-for-beginners',
		title: 'Pickleball Rules for Beginners: A Simple Guide',
		description: 'A clear beginner explainer of pickleball scoring, the kitchen, double-bounce rule, and common faults — without legal jargon.',
		category: 'rules', type: 'how-to', featured: true,
		products: ['joola-vision-c15', 'franklin-signature-portable-net'],
		tags: ['rules', 'beginners', 'kitchen'],
		faq: faq5([
			['What is the kitchen?', 'The non-volley zone near the net. You cannot volley while touching it.'],
			['What is the double-bounce rule?', 'The ball must bounce once on each side before volleys are allowed.'],
			['Do you need to say the score?', 'In recreational play, calling the score before serving keeps chaos down. {{ TODO: confirm }} formal tournament scoring call format you want published site-wide.'],
			['Can the paddle hit the net?', 'Contacting the net during a point is a fault in standard play. {{ TODO: confirm }} cite the exact current USA Pickleball / PCO rule reference you prefer.'],
			['Where to practice rules at home?', 'A portable net and chalk lines — see court dimensions guide.'],
		]),
		links: ['/guides/pickleball-terms-glossary', '/guides/pickleball-court-dimensions', '/guides/how-to-choose-a-pickleball-paddle'],
		compare: ['joola-vision-c15', 'franklin-signature-portable-net'],
		sections: [
			['The point, simply', 'Serve underhand, let the return bounce, let the next shot bounce (double-bounce rule), then the rally can include volleys — except you cannot volley in the kitchen.'],
			['Scoring basics', 'Games often play to 11, win by 2, and only the serving side scores in classic side-out scoring. {{ TODO: confirm }} whether you want to emphasize rally scoring variants used in some leagues.'],
			['Kitchen discipline', 'The non-volley zone creates the soft game. Momentum into the kitchen after a volley still faults if you touch the zone.'],
			['Gear note', 'Rules knowledge plus a forgiving beginner paddle beats buying power gear you cannot control yet.'],
		],
	},
	{
		slug: 'pickleball-vs-tennis',
		title: 'Pickleball vs Tennis: Key Differences Explained',
		description: 'Court size, gear, pacing, and skills that transfer — a clear pickleball vs tennis comparison for curious athletes.',
		category: 'guides', type: 'informational', featured: false,
		products: ['joola-hyperion-cas-16', 'asics-gel-resolution-9', 'franklin-signature-portable-net'],
		tags: ['tennis', 'beginners', 'comparison'],
		faq: faq5([
			['Is pickleball easier than tennis?', 'Easier to start, not necessarily easy to master. The learning curve is friendlier; the kitchen game is deep.'],
			['Can tennis shoes work?', 'Court tennis shoes often transfer well; running shoes do not.'],
			['Will tennis strokes transfer?', 'Some yes, but paddle contact and soft game require recalibration.'],
			['Smaller court means less fitness?', 'Matches can still be intense — especially at higher levels.'],
			['What gear do tennis players need first?', 'A paddle and court shoes; a portable net if building a home court.'],
		]),
		links: ['/guides/pickleball-rules-for-beginners', '/guides/how-to-choose-a-pickleball-paddle', '/guides/best-pickleball-shoes-2026'],
		compare: ['joola-hyperion-cas-16', 'asics-gel-resolution-9'],
		sections: [
			['Court and pacing', 'Pickleball courts are smaller, points can be shorter, and the non-volley zone creates a unique tactical layer tennis does not share.'],
			['Gear differences', 'Solid paddles vs strung racquets; lower launch point on serves; shoes still need lateral court design.'],
			['Skills that transfer', 'Anticipation, footwork discipline, and competitive temperament transfer. Grip firmness and swing length usually need shrinking.'],
		],
	},
	{
		slug: 'pickleball-court-dimensions',
		title: 'Pickleball Court Dimensions & How to Set Up a Net',
		description: 'Pickleball court dimensions, kitchen lines, and a practical portable net setup guide for driveways and parks in Canada.',
		category: 'rules', type: 'how-to', featured: false,
		products: ['franklin-signature-portable-net', 'onix-portable-pickleball-net', 'rally-portable-net-set', 'selkirk-portable-net-system'],
		tags: ['rules', 'court', 'nets', 'setup'],
		faq: faq5([
			['What are official court dimensions?', 'A standard pickleball court is 20 feet by 44 feet. {{ TODO: confirm }} publish any additional PCO/USAP diagram notes you want cited.'],
			['How wide is the kitchen?', 'The non-volley zone extends 7 feet from the net on each side.'],
			['Can I set up on a driveway?', 'Yes, if you have length/width and safe surfacing — watch slopes and cars.'],
			['Best portable net for setup practice?', 'Franklin and Rally are common home picks; ONIX/Selkirk for premium tension.'],
			['Prices live?', 'No.'],
		]),
		links: ['/guides/best-portable-pickleball-nets-2026', '/guides/franklin-vs-onix-vs-rally-vs-selkirk-nets', '/guides/pickleball-rules-for-beginners', '/gear/nets'],
		compare: ['franklin-signature-portable-net', 'onix-portable-pickleball-net', 'rally-portable-net-set'],
		sections: [
			['Dimensions that matter', '20x44 court, 7-foot kitchens each side, net 36" posts / 34" center. Measure twice before you paint or tape permanently.'],
			['Portable setup sequence', 'Clear debris, assemble frame per manufacturer instructions, tension the center strap to 34", verify posts at 36", then mark baselines and sidelines.'],
			['Canadian outdoor tips', 'Wind, uneven asphalt, and cold-weather brittle plastic stakes are real. Weight the frame safely and do not leave nets out in storms.'],
		],
	},
	{
		slug: 'pickleball-terms-glossary',
		title: 'Pickleball Terms Glossary: Dink, Kitchen, Erne & More',
		description: 'A practical pickleball glossary covering dink, kitchen, erne, ATP, third-shot drop, and other terms new players hear on court.',
		category: 'rules', type: 'informational', featured: false,
		products: ['selkirk-slk-halo-control-xl', 'joola-ben-johns-hyperion-c2'],
		tags: ['glossary', 'rules', 'beginners', 'terms'],
		faq: faq5([
			['What is a dink?', 'A soft shot that lands in the opponent kitchen, designed to stay low and unattackable.'],
			['What is an erne?', 'A volley attack where a player jumps or steps outside the sideline around the kitchen to intercept — advanced timing required.'],
			['What is ATP?', 'Around the post: a legal shot that travels outside the net posts when geometry allows.'],
			['What is a third-shot drop?', 'A soft third shot after the serve and return that lands in the kitchen to neutralize pace.'],
			['Why does jargon matter for gear?', 'If you are a dinker, buy control. If you live on drives, consider power — intentionally.'],
		]),
		links: ['/guides/pickleball-rules-for-beginners', '/guides/best-pickleball-paddles-for-control', '/guides/how-to-choose-a-pickleball-paddle'],
		compare: ['selkirk-slk-halo-control-xl', 'joola-ben-johns-hyperion-c2'],
		sections: [
			['Kitchen (NVZ)', 'Non-volley zone. The painted area that forces soft-game craft.'],
			['Dink', 'The chess move of pickleball. Soft, low, patient.'],
			['Third-shot drop', 'The bridge from baseline to kitchen for the serving team.'],
			['Speed-up', 'A sudden attack when a ball sits up — high risk, high reward.'],
			['Erne & ATP', 'Highlight-reel shots. Learn resets before you learn circus shots.'],
			['Banger', 'Affectionate (sometimes not) term for a hard-hitting pace player.'],
		],
	},
];

function expand(a) {
	const intro = `${a.description.replace(/\.$/, '')}. This guide stays practical, references only products in our catalog, and links deeper reads so you can keep learning without getting stuck in marketing noise.`;
	const sectionMd = a.sections
		.map(([h, p]) => `## ${h}\n\n${p}`)
		.join('\n\n');
	const linkMd = a.links.map((l) => `- [${l}](${l})`).join('\n');
	const compareJsx = `<ComparisonTable productIds={${JSON.stringify(a.compare)}} />`;
	const pros = `<ProsCons
  pros={["Practical, audience-specific advice","Tied to real catalog products","Internal links to keep researching"]}
  cons={["Not a substitute for hands-on demo","Amazon availability changes","Approximate catalog prices only"]}
/>`;
	const body = `${intro}

<Callout type="tip" title="Affiliate note">
As an Amazon Associate we may earn from qualifying purchases. Prices shown on site are approximate catalog references — always check the current price on Amazon.ca.
</Callout>

${sectionMd}

${compareJsx}

${pros}

## Keep learning

${linkMd}

<Callout type="pick" title="Next step">
Shortlist two options, confirm fit/feel priorities, then use Check current price on Amazon before you buy.
</Callout>
`;
	return { ...a, body };
}

for (const a of articles) {
	fs.writeFileSync(path.join(dir, `${a.slug}.mdx`), fm(a) + '\n' + a.body.trim() + '\n');
}
for (const a of rest.map(expand)) {
	fs.writeFileSync(path.join(dir, `${a.slug}.mdx`), fm(a) + '\n' + a.body.trim() + '\n');
}

console.log(`Wrote ${articles.length + rest.length} articles`);
