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
    },

    allPostTitles() {
      // console.log(window.store.getters['posts/allPostTitles'])
      return window.store.getters['posts/allPostTitles']
    }
  },

  methods: {
    increment() {
      window.store.commit('INCREMENT', 1)
      window.store.commit('posts/ADD_POST', { id: 2, title: 'My new post' })
    },

    incrementAsync() {
      window.store.dispatch('incrementAsync', parseInt(Math.random() * 100))
      window.store.dispatch('posts/fetchPosts', { id: 3, title: 'My async post' })
    }
  },

  template: `
    <div>Count is {{ count }} <br />
      <button @click="increment">Increment</button>
      <button @click="incrementAsync">Increment Async</button>
      Posts: {{ posts }}
      <br />
      <h3>Posts</h3>
      <div v-for="title in allPostTitles" :key="title">{{ title }}</div>
    </div>`
}

document.addEventListener('DOMContentLoaded', () => {
  const { reactive, computed } = Vue

  const constructNestedMutations = (modules) => {
    const mut = {}
    for (const [name, module] of modules) {
      for (const [handler, fn] of Object.entries(module.mutations)) {
        mut[`${name}/${handler}`] = fn
      }
    }
    return mut
  }

  const constructNestedActions = (modules) => {
    const actions = {}
    for (const [name, module] of modules) {
      for (const [handler, fn] of Object.entries(module.actions)) {
        actions[`${name}/${handler}`] = fn
      }
    }
    return actions
  }

  const constructNestedState = modules => {
    const state = {}
    for (const [name, module] of modules) {
      state[name] = module.state
    }
    return state
  }

  const constructNestedGetters = (modules, state) => {
    const getters = {}
    for (const [name, module] of modules) {
      for (const [handler, fn] of Object.entries(module.getters)) {
        // console.log(
        //   handler,
        //   fn
        // )
        module.getters[handler](state[name])

        Object.defineProperty(getters, `${name}/${handler}`, {
          get: () => computed(() => module.getters[handler](state[name])).value
          // get: () => computed(() => state[`${name}/${handler}`]) // (state))
        })
      }
    }
    // console.log(getters) // ['posts/allPostsTitle'])
    return getters
  }

  const moduleName = handler => {
    const isModule = handler.includes('/')
    return isModule && handler.split('/')[0] || ''
  }

  class Store {
    constructor(options) {
      const nestedState = constructNestedState(Object.entries(options.modules))
      const nested = constructNestedMutations(Object.entries(options.modules))
      this.state = reactive({...options.state, ...nestedState})
      this.mutations = {...options.mutations, ...nested}
      this.actions = {...options.actions,  ...constructNestedActions(Object.entries(options.modules))}
      // this.getters = {
      //   'posts/allPostTitles': []
      // }
      this.getters =  constructNestedGetters(Object.entries(options.modules), this.state)
       // {...options.getters, ...constructNestedGetters(Object.entries(options.modules), this.state)}
    }

    commit(handler, payload) {
      const name = moduleName(handler)
      this.mutations[handler](
        name ? this.state[name] : this.state, payload
      )
    }

    async dispatch(handler, payload) {
      try {
        const name = moduleName(handler)
        const action = this.actions[handler].bind(this)
        action({
          state: this.state,
          commit: this.commit,
          mutations: this.mutations,
          prefix: name
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
            ctx.commit(`${ctx.prefix}/ADD_POST`, payload)
          }
        },

        getters: {
          allPostTitles: state => {
            // console.log(state.data)
            // console.log(
            //   state.data.map(x => x.title)
            // )

            return state.data.map(x => x.title)
          }
        }
      }
    }
  })

  window.store = store

  Vue.createApp().mount(App, '#app')
})
