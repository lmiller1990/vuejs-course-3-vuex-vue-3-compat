const App = {
  setup() {
    return {
      hello: 'hello world'
    }
  },

  computed: {
    posts() {
      return window.store.state.posts
    },

    allPostTitles() {
      // if I call `.value` it works? No automatic unwrap?
      return window.store.getters['allPostTitles']
    }
  },

  methods: {
    addPost() {
      window.store.commit('ADD_POST', { id: (Math.random() * 100).toFixed(), title: 'Title' })
    }
  },

  template: `
    <div>
      <button @click="addPost">Add Post</button>
      <h3>Post Titles</h3>
      <div v-for="title in allPostTitles" :key="title">{{ title }}</div>
    </div>`
}

document.addEventListener('DOMContentLoaded', () => {
  const { reactive, computed } = Vue

  // make getters reactive with computed
  const makeGetters = (getters, state) => {
    const _getters = {}
    for (const [handler, fn] of Object.entries(getters)) {
      _getters[`${handler}`] = computed(() => {
        return fn(state)
      })
    }
    return _getters
  }

  class Store {
    constructor(options) {
      this.state = reactive({ ...options.state })
      this.mutations = options.mutations
      this.actions = options.actions
      this.getters = makeGetters(options.getters, this.state)
    }

    commit(handler, payload) {
      this.mutations[handler](this.state, payload)
    }
  }

  const Vuex = {
    Store
  }

  const store = new Vuex.Store({
    state: {
      posts: [{ id: 1, title: 'A post' }]
    },

    mutations: {
      ADD_POST(state, payload) {
        state.posts.push(payload)
      }
    },

    getters: {
      allPostTitles: state => {
        console.log('calling', state)
        return state.posts.map(x => x.title)
      }
    }
  })

  window.store = store

  Vue.createApp().mount(App, '#app')
})
