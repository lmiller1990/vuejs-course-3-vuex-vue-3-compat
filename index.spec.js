import { Vuex } from './'

const createStore = () => new Vuex.Store({
  state: {
    count: 1,
  },

  mutations: {
    INCREMENT(state, payload) {
      state.count += payload
    }
  },

  actions: {
    increment(context, payload) {
      context.commit('INCREMENT', payload)
    }
  },

  getters: {
    triple: state => state.count * 3
  }
})

test('commtting mutations', () => {
  const store = createStore()
  store.commit('INCREMENT', 1)
  expect(store.state.count).toBe(2)
})

test('dispatch actions', () => {
  const store = createStore()
  return store.dispatch('increment', 1).then(() => {
    expect(store.state.count).toBe(2)
  })
})

test('getters', () => {
  const store = createStore()
  expect(store.getters['triple']).toBe(3)
  store.commit('INCREMENT', 1)
  expect(store.getters['triple']).toBe(6)
})
