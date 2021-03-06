import useTitleBar from "../hooks/useTitleBar";
import { getCols, helpers } from "../util";
import { DataTable, MoreLinks, MovOrDiff } from "../components";
import type { View } from "../../common/types";

const HeadToHead = ({
	abbrev,
	season,
	teams,
	tid,
	ties,
	type,
	otl,
	userTid,
}: View<"headToHead">) => {
	useTitleBar({
		title: "Head-to-Head",
		dropdownView: "head2head",
		dropdownFields: {
			teams: abbrev,
			seasonsAndAll: season,
			playoffsAll: type,
		},
	});

	const cols = getCols(
		"Team",
		"W",
		"L",
		...(otl ? ["OTL"] : []),
		...(ties ? ["T"] : []),
		"%",
		"PS",
		"PA",
		"Diff",
		"PS/g",
		"PA/g",
		"Diff",
		...(type === "regularSeason"
			? []
			: ["Rounds Won", "Rounds Lost", "Finals Won", "Finals Lost"]),
	);

	const rows = teams.map(t => {
		const urlParts: (string | number)[] = ["roster", `${t.abbrev}_${t.tid}`];
		if (season !== "all") {
			urlParts.push(season);
		}

		const gp = t.won + t.lost + t.otl + t.tied;

		const movOrDiffStats = {
			pts: t.pts,
			oppPts: t.oppPts,
			gp,
		};

		return {
			key: t.tid,
			data: [
				<a href={helpers.leagueUrl(urlParts)}>
					{t.region} {t.name}
				</a>,
				t.won,
				t.lost,
				...(otl ? [t.otl] : []),
				...(ties ? [t.tied] : []),
				helpers.roundWinp(t.winp),
				helpers.roundStat(t.pts, "pts", true),
				helpers.roundStat(t.oppPts, "pts", true),
				<MovOrDiff stats={movOrDiffStats} type="diff" />,
				helpers.roundStat(t.pts / gp, "pts"),
				helpers.roundStat(t.oppPts / gp, "pts"),
				<MovOrDiff stats={movOrDiffStats} type="mov" />,
				...(type === "regularSeason"
					? []
					: [t.seriesWon, t.seriesLost, t.finalsWon, t.finalsLost]),
			],
			classNames: {
				"table-info": t.tid === userTid,
			},
		};
	});

	return (
		<>
			<MoreLinks
				type="team"
				page="head2head"
				abbrev={abbrev}
				tid={tid}
				season={season === "all" ? undefined : season}
			/>

			<p>
				View{" "}
				<a href={helpers.leagueUrl(["head2head_all", season, type])}>
					head-to-head results for all teams
				</a>{" "}
				in one giant table.
			</p>

			<DataTable
				cols={cols}
				defaultSort={[0, "asc"]}
				name="HeadToHead"
				nonfluid
				rows={rows}
			/>
		</>
	);
};

export default HeadToHead;
