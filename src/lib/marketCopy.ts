import { MARKET_COUNTRY, SITE_REGION } from './site';

/**
 * Build-time localization for shared English catalogs and guides.
 * CA still ships the same MDX/JSON as US; these replacements stop the Canadian
 * host from advertising itself as a US site in titles, metas, FAQs, and product copy.
 *
 * USAPA is the retired acronym — CA uses a neutral tournament label; US uses
 * USA Pickleball (the current standard name). Do not invent Pickleball Canada
 * approvals unless they are verified in gear.json.
 */
export function marketizeCopy(text: string): string {
	if (!text) return text;

	const approved = SITE_REGION === 'ca' ? 'tournament-approved' : 'USA Pickleball-approved';
	const ready = SITE_REGION === 'ca' ? 'tournament-ready' : 'USA Pickleball-ready';
	const compliant = SITE_REGION === 'ca' ? 'tournament-compliant' : 'USA Pickleball-compliant';
	const body = SITE_REGION === 'ca' ? 'tournament' : 'USA Pickleball';

	let out = text
		.replaceAll(/USAPA tournament approved/gi, approved)
		.replaceAll(/USAPA-approved/gi, approved)
		.replaceAll(/USAPA approved/gi, approved)
		.replaceAll(/USAPA-ready/gi, ready)
		.replaceAll(/USAPA compliant/gi, compliant)
		.replaceAll(/max USAPA texture/gi, `max ${body} texture`)
		.replaceAll(/USAPA\/IFP/gi, SITE_REGION === 'ca' ? 'tournament' : 'USA Pickleball/IFP')
		.replaceAll(/\bUSAPA\b/g, body);

	if (SITE_REGION !== 'ca') return out;

	return out
		.replaceAll('the USA Pickleball approved equipment list', "the event's approved-equipment list")
		.replaceAll('USA Pickleball approved equipment list', "the event's approved-equipment list")
		.replaceAll('USA Pickleball-approved', 'tournament-approved')
		.replaceAll('USA Pickleball approved', 'tournament-approved')
		.replaceAll('players in the US', 'players in Canada')
		.replaceAll('new US players', 'new Canadian players')
		.replaceAll('advanced US players', 'advanced Canadian players')
		.replaceAll('intermediate US players', 'intermediate Canadian players')
		.replaceAll('recreational US players', 'recreational Canadian players')
		.replaceAll('frequent US players', 'frequent Canadian players')
		.replaceAll('weekend US players', 'weekend Canadian players')
		.replaceAll('US players', 'Canadian players')
		.replaceAll('US hard courts', 'Canadian hard courts')
		.replaceAll('US outdoor acrylic', 'Canadian outdoor acrylic')
		.replaceAll('US outdoor courts', 'Canadian outdoor courts')
		.replaceAll('US backyard and park players', 'Canadian backyard and park players')
		.replaceAll('US driveways', 'Canadian driveways')
		.replaceAll('US backyard', 'Canadian backyard')
		.replaceAll('high-intent US search', 'high-intent Canadian search')
		.replaceAll('high-intent US searches', 'high-intent Canadian searches')
		.replaceAll('US searches', 'Canadian searches')
		.replaceAll('US search', 'Canadian search')
		.replaceAll('US club and tournament', 'Canadian club and tournament')
		.replaceAll('US club and league', 'Canadian club and league')
		.replaceAll('US club nights', 'Canadian club nights')
		.replaceAll('US club players', 'Canadian club players')
		.replaceAll('US club', 'Canadian club')
		.replaceAll('US shoppers', 'Canadian shoppers')
		.replaceAll('US families', 'Canadian families')
		.replaceAll('US weather', 'Canadian weather')
		.replaceAll('US shoulder seasons', 'Canadian shoulder seasons')
		.replaceAll('Cold US shoulder', 'Cold Canadian shoulder')
		.replaceAll('High-demand US brand', 'High-demand brand')
		.replaceAll('the US paddle market', 'the Canadian paddle market')
		.replaceAll('in the US paddle market', 'in the Canadian paddle market')
		.replaceAll('popular US catalog', 'popular Canadian catalog')
		.replaceAll('US catalog', 'Canadian catalog')
		.replaceAll('for US courts', 'for Canadian courts')
		.replaceAll('for US outdoor', 'for Canadian outdoor')
		.replaceAll('The US store', 'The Canada store')
		.replaceAll('the US store', 'the Canada store')
		.replaceAll('in the US', 'in Canada')
		.replaceAll('between states', 'between provinces');
}

/** Give each host a unique SERP title when the authored title is market-agnostic. */
export function marketizeTitle(title: string): string {
	const localized = marketizeCopy(title);
	if (/\bCanada\b|\bCanadian\b|\bthe US\b|\bUS\b/.test(localized)) {
		return localized;
	}
	const loc = SITE_REGION === 'ca' ? 'Canada' : MARKET_COUNTRY;
	const colon = localized.indexOf(':');
	if (colon > 0) {
		return `${localized.slice(0, colon)} in ${loc}${localized.slice(colon)}`;
	}
	return `${localized} in ${loc}`;
}

export function marketizeFaq(
	items: { question: string; answer: string }[],
): { question: string; answer: string }[] {
	return items.map((item) => ({
		question: marketizeCopy(item.question),
		answer: marketizeCopy(item.answer),
	}));
}
