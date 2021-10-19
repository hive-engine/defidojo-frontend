export default async ({ store }) => {
  await store.dispatch('fetchSettings', { root: true })
}
