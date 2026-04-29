import { useTranslation } from "react-i18next"
import { getDeitySources } from "../data/Scholarship"
import {
  liverGods,
  liverGroups,
  liverInscriptions,
  type ParallelLocaleTranslator,
  resolveDeityParallels,
} from "../scene/LiverData"

const srOnly: React.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: 0,
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
}

export function SeoContent() {
  const { t: tAbout } = useTranslation("about")
  const { t: tLiverData } = useTranslation("liverData")

  const totalInscriptions = liverInscriptions.length
  const totalZones = Object.keys(liverGroups).length
  const totalDeities = Object.keys(liverGods).length

  const sections = tAbout("sections", {
    returnObjects: true,
  }) as Record<string, { heading: string; content: string }>

  return (
    <article style={srOnly}>
      <h2>{tAbout("subtitle")}</h2>
      <p>{tAbout("intro", { totalInscriptions, totalZones, totalDeities })}</p>

      {Object.entries(sections).map(([key, section]) => (
        <section key={key}>
          <h3>
            {tAbout(`sections.${key}.heading`, {
              defaultValue: section?.heading,
            })}
          </h3>
          <p>
            {tAbout(`sections.${key}.content`, {
              totalInscriptions,
              totalZones,
              totalDeities,
              defaultValue: section?.content,
            })}
          </p>
        </section>
      ))}

      <h3>Cosmological Zones</h3>
      {Object.values(liverGroups).map((group) => (
        <section key={group.id}>
          <h4>{tLiverData(`groups.${group.id}.name`)}</h4>
          <p>{tLiverData(`groups.${group.id}.description`)}</p>
        </section>
      ))}

      <h3>Etruscan Deities</h3>
      <dl>
        {Object.entries(liverGods).map(([id, god]) => {
          const description = tLiverData(`deities.${id}.description`)
          const parallels = resolveDeityParallels(
            tLiverData as ParallelLocaleTranslator,
            id,
          )
          const parallelText = parallels
            .map(
              (p) =>
                ` ${p.tradition === "roman" ? "Roman" : "Greek"} parallel: ${p.name} (${p.status}).`,
            )
            .join("")
          const sources = getDeitySources(id)
          const sourcesText =
            sources.length > 0 ? ` Sources: ${sources.join(", ")}.` : ""
          return (
            <div key={id}>
              <dt>{god.name}</dt>
              <dd>
                {description}
                {parallelText}
                {sourcesText}
              </dd>
            </div>
          )
        })}
      </dl>

      <p>
        <a href="/inscriptions/">
          Explore all {totalInscriptions} inscriptions
        </a>
      </p>
    </article>
  )
}
