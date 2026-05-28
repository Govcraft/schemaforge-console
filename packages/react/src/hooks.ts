// @schemaforge/react — headless data hooks.
//
// DECISION (query library): react-query is a PEER dependency. The host owns the
// QueryClient; these hooks just describe queries. A host that doesn't use
// react-query can ignore these hooks entirely and call the injected ForgeClient
// directly — the presentational components below take plain props, not hooks.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  findChildRelations,
  type ChildRelation,
  type EntityRow,
  type ListEntitiesParams,
  type ListEntitiesResult,
  type SchemaResponse,
  type SchemaView,
} from "@schemaforge/client"
import { useForgeClient } from "./context"

export function useSchemas() {
  const client = useForgeClient()
  return useQuery<SchemaResponse[]>({
    queryKey: ["forge", "schemas"],
    queryFn: () => client.listSchemas(),
  })
}

export function useSchema(schema: string | undefined) {
  const client = useForgeClient()
  return useQuery<SchemaView>({
    queryKey: ["forge", "schema", schema],
    queryFn: () => client.describeSchema(schema!),
    enabled: Boolean(schema),
  })
}

export function useEntityList(schema: string | undefined, params: ListEntitiesParams) {
  const client = useForgeClient()
  return useQuery<ListEntitiesResult>({
    queryKey: ["forge", "entities", schema, params],
    queryFn: () => client.listEntities(schema!, params),
    enabled: Boolean(schema),
    placeholderData: (prev) => prev,
  })
}

export function useEntity(schema: string | undefined, id: string | undefined) {
  const client = useForgeClient()
  return useQuery<EntityRow>({
    queryKey: ["forge", "entity", schema, id],
    queryFn: () => client.getEntity(schema!, id!),
    enabled: Boolean(schema && id),
  })
}

/** Headless relation-options source: powers RelationSelect, but a host can use
 *  it to build its own combobox. Labels each option by the target schema's
 *  @display field, falling back to the id. */
export function useRelationOptions(targetSchema: string | undefined) {
  const client = useForgeClient()
  return useQuery({
    queryKey: ["forge", "relation-options", targetSchema],
    queryFn: async () => {
      const view = await client.describeSchema(targetSchema!)
      const list = await client.listEntities(targetSchema!, { limit: 100 })
      const labelField = view.displayField
      return list.rows.map((r) => ({
        id: r.id,
        label: labelField && typeof r[labelField] === "string" ? (r[labelField] as string) : r.id,
      }))
    },
    enabled: Boolean(targetSchema),
  })
}

/** Discover the child collections of a parent schema: every other schema with
 *  a relation_one field targeting it. Describes all schemas once (cached by
 *  react-query). The host renders one connected section per returned relation.
 *  NOTE: O(schemas) describe calls — fine for typical schema counts; revisit
 *  with a server-side relations endpoint if catalogs grow large. */
export function useChildRelations(parentSchema: string | undefined) {
  const client = useForgeClient()
  return useQuery<ChildRelation[]>({
    queryKey: ["forge", "child-relations", parentSchema],
    enabled: Boolean(parentSchema),
    queryFn: async () => {
      const schemas = await client.listSchemas()
      const views = await Promise.all(schemas.map((s) => client.describeSchema(s.name)))
      return findChildRelations(parentSchema!, views)
    },
  })
}

export function useEntityMutations(schema: string | undefined) {
  const client = useForgeClient()
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ["forge", "entities", schema] })

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => client.createEntity(schema!, body),
    onSuccess: invalidate,
  })
  const update = useMutation({
    mutationFn: (args: { id: string; body: Record<string, unknown> }) =>
      client.updateEntity(schema!, args.id, args.body),
    onSuccess: invalidate,
  })
  const remove = useMutation<void, Error, string>({
    mutationFn: (id: string) => client.deleteEntity(schema!, id),
    onSuccess: invalidate,
  })
  return { create, update, remove }
}

export type { EntityRow }
