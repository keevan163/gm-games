import PropTypes from "prop-types";
import type { ReactNode } from "react";
import { getCols, helpers, prefixStatOpp } from "../util";
import useTitleBar from "../hooks/useTitleBar";
import { DataTable, PlusMinus, MoreLinks } from "../components";
import type { View } from "../../common/types";
import { isSport } from "../../common";

const legendSquare = (className: string) => {
	return <span className={`table-${className} legend-square ml-3`} />;
};

const TeamStats = ({
	allStats,
	playoffs,
	season,
	stats,
	superCols,
	teamOpponent,
	teams,
	ties,
	otl,
	userTid,
}: View<"teamStats">) => {
	useTitleBar({
		title: "Team Stats",
		jumpTo: true,
		jumpToSeason: season,
		dropdownView: "team_stats",
		dropdownFields: {
			seasons: season,
			teamOpponentAdvanced: teamOpponent,
			playoffs,
		},
	});

	const basicColNames = ["Team", "stat:gp", "W", "L"];
	if (otl) {
		basicColNames.push("OTL");
	}
	if (ties) {
		basicColNames.push("T");
	}

	const cols = getCols(
		...basicColNames,
		...stats.map(stat => {
			if (stat.startsWith("opp")) {
				return `stat:${stat.charAt(3).toLowerCase()}${stat.slice(4)}`;
			}
			return `stat:${stat}`;
		}),
	);

	if (teamOpponent.endsWith("ShotLocations")) {
		cols[cols.length - 3].title = "M";
		cols[cols.length - 2].title = "A";
		cols[cols.length - 1].title = "%";
	}

	const teamCount = teams.length;
	const rows = teams.map(t => {
		const otherStatColumns = ["won", "lost"];
		if (otl) {
			otherStatColumns.push("otl");
		}
		if (ties) {
			otherStatColumns.push("tied");
		}

		// Create the cells for this row.
		const data: { [key: string]: ReactNode } = {
			abbrev: (
				<a
					href={helpers.leagueUrl([
						"roster",
						`${t.seasonAttrs.abbrev}_${t.tid}`,
						season,
					])}
				>
					{t.seasonAttrs.abbrev}
				</a>
			),
			gp: t.stats.gp,
			won: t.seasonAttrs.won,
			lost: t.seasonAttrs.lost,
		};

		if (otl) {
			data.otl = t.seasonAttrs.otl;
		}
		if (ties) {
			data.tied = t.seasonAttrs.tied;
		}

		for (const stat of stats) {
			const value = t.stats.hasOwnProperty(stat)
				? (t.stats as any)[stat]
				: (t.seasonAttrs as any)[stat];
			data[stat] = helpers.roundStat(value, stat);
		}

		if (isSport("basketball") || isSport("hockey")) {
			const plusMinusCols = [prefixStatOpp(teamOpponent, "mov"), "nrtg"];
			for (const plusMinusCol of plusMinusCols) {
				if (data.hasOwnProperty(plusMinusCol)) {
					data[plusMinusCol] = (
						<PlusMinus>{(t.stats as any)[plusMinusCol]}</PlusMinus>
					);
				}
			}
		}

		// This is our team.
		if (userTid === t.tid) {
			// Color stat values accordingly.
			for (const [statType, value] of Object.entries(data)) {
				if (
					(!stats.includes(statType) && !otherStatColumns.includes(statType)) ||
					!allStats[statType]
				) {
					continue;
				}

				// Determine our team's percentile for this stat type. Closer to the start is better.
				const statTypeValue = t.stats.hasOwnProperty(statType)
					? (t.stats as any)[statType]
					: (t.seasonAttrs as any)[statType];
				const percentile =
					1 - allStats[statType].indexOf(statTypeValue) / (teamCount - 1);

				let className;
				if (percentile >= 2 / 3) {
					className = "table-success";
				} else if (percentile >= 1 / 3) {
					className = "table-warning";
				} else {
					className = "table-danger";
				}

				data[statType] = {
					classNames: className,
					value,
				};
			}

			return {
				key: t.tid,
				data: Object.values(data),
			};
		}

		return {
			key: t.tid,
			data: Object.values(data),
		};
	});

	return (
		<>
			<div className="d-sm-flex">
				<MoreLinks type="teamStats" page="team_stats" season={season} />
				<p className="flex-grow-1 text-right">
					For a statistical category, among all teams, your team is in the...
					<br />
					{legendSquare("success")} <strong>Top third</strong>
					{legendSquare("warning")} <strong>Middle third</strong>
					{legendSquare("danger")} <strong>Bottom third</strong>
				</p>
			</div>

			<DataTable
				cols={cols}
				defaultSort={[2, "desc"]}
				name={`TeamStats${teamOpponent}`}
				rows={rows}
				superCols={superCols}
			/>
		</>
	);
};

TeamStats.propTypes = {
	allStats: PropTypes.object.isRequired,
	playoffs: PropTypes.oneOf(["playoffs", "regularSeason"]).isRequired,
	season: PropTypes.number.isRequired,
	stats: PropTypes.arrayOf(PropTypes.string).isRequired,
	superCols: PropTypes.array,
	teamOpponent: PropTypes.oneOf([
		"advanced",
		"opponent",
		"team",
		"teamShotLocations",
		"opponentShotLocations",
	]).isRequired,
	teams: PropTypes.arrayOf(PropTypes.object).isRequired,
	otl: PropTypes.bool.isRequired,
	ties: PropTypes.bool.isRequired,
	userTid: PropTypes.number.isRequired,
};

export default TeamStats;
