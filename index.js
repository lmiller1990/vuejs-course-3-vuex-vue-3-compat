const App = {
  setup() {
    return {
      hello: 'hello world'
    }
  },

  computed: {
    count() {
      return window.store.state.count
    }
  },

  methods: {
    increment() {
      window.store.commit('INCREMENT', 1)
    },

    incrementAsync() {
      window.store.dispatch('incrementAsync', parseInt(Math.random() * 100))
    }
  },

  template: `
    <div>Count is {{ count }} <br />
      <button @click="increment">Increment</button>
      <button @click="incrementAsync">Increment Async</button>
    </div>`
}

document.addEventListener('DOMContentLoaded', () => {
  const { reactive } = Vue

  let mut = {}
  const constructNestedMutations = (modules) => {
    for (const [name, module] of modules) {
      console.log(name, module)
      for (const [handler, fn] of Object.entries(module.mutations)) {
        console.log(handler, fn)
        mut[`${name}/${handler}`] = fn
      }
    }
  }

  class Store {
    constructor(options) {
      const state = reactive(options.state)
      this.state = state
      this.mutations = options.mutations
      this.actions = options.actions
      constructNestedMutations(Object.entries(options.modules))
      console.log(mut)
    }

    commit(handler, payload) {
      this.mutations[handler](this.state, payload)
    }

    async dispatch(handler, payload) {
      try {
        const action = this.actions[handler].bind(this)
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
