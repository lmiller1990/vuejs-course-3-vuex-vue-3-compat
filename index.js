const App = {
  setup() {
    return {
      hello: 'hello world'
    }
  },

  computed: {
    count() {
      return window.store.state.count
    },

    posts() {
      return window.store.state.posts
    }
  },

  methods: {
    increment() {
      window.store.commit('INCREMENT', 1)
      window.store.commit('posts/ADD_POST', { id: 2, title: 'My new post' })
    },

    incrementAsync() {
      window.store.dispatch('incrementAsync', parseInt(Math.random() * 100))
    }
  },

  template: `
    <div>Count is {{ count }} <br />
      <button @click="increment">Increment</button>
      <button @click="incrementAsync">Increment Async</button>
      Posts: {{ posts }}
    </div>`
}

document.addEventListener('DOMContentLoaded', () => {
  const { reactive } = Vue

  const constructNestedMutations = (modules) => {
    const mut = {}
    for (const [name, module] of modules) {
      for (const [handler, fn] of Object.entries(module.mutations)) {
        mut[`${name}/${handler}`] = fn
      }
    }
    return mut
  }

  const constructNestedState = modules => {
    const state = {}
    for (const [name, module] of modules) {
      state[name] = module.state
    }
    return state
  }

  class Store {
    constructor(options) {
      this.actions = options.actions
      const nestedState = constructNestedState(Object.entries(options.modules))
      const nested = constructNestedMutations(Object.entries(options.modules))
      this.state = reactive({...options.state, ...nestedState})
      this.mutations = {...options.mutations, ...nested}
    }

    commit(handler, payload) {
      const isModule = handler.includes('/')
      let moduleName 
      if (isModule) {
        moduleName = handler.split('/')[0]
      }
      this.mutations[handler](
        moduleName ? this.state[moduleName] : this.state, payload
      )
    }

    async dispatch(handler, payload) {
      try {
        const action = this.actions[handler]
        action({
          state: this.state,
          commit: this.commit,
          mutations: this.mutations
        }, payload)
      } catch (e) {
        throw e
      }
    }
  }

  const Vuex = {
    Store
  }

  const delay = () => new Promise(res => setTimeout(res, 500))


  const store = new Vuex.Store({
    state: {
      count: 1
    },

    mutations: {
      INCREMENT(state, payload) {
        state.count += payload
      }
    },

    actions: {
      async incrementAsync(ctx, payload) {
        await delay()
        ctx.commit('INCREMENT', payload)
      }
    },

    modules: {
      posts: {
        namespaced: true,

        state: {
          data: [{ id: 1, title: 'My Post' }]
        },

        mutations: {
          ADD_POST(state, payload) {
            state.data.push(payload)
          }
        },

        actions: {
          async fetchPosts(ctx, payload) {
            ctx.commit('ADD_POST', payload)
          }
        }
      }
    }
  })

  window.store = store

  Vue.createApp().mount(App, '#app')
})
