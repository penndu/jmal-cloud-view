<template>
  <div class="container">
    <table-list
      v-if="dataList.length > 0"
      :less-client-height="245"
      :tableData="dataList"
      :loading="loading"
      :hasSelection="false"
      :border="false"
      :tableHeader="tableHeader"
    ></table-list>
  </div>
</template>

<script>
import { getTaskProgress } from '@/api/setting-api'
import TableList from "@/components/table/TableList"
import {mapState} from "vuex";

export default {
  name: 'TaskProgress',
  components: {
    TableList
  },
  props: {
    data: {
      type: Array,
      default: []
    },
    monitor: {
      type: Boolean,
      default: false
    },
    taskCount: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(['message'])
  },
  data() {
    return {
      dataList: [],
      loading: false,
      tableHeader: [
        {prop: 'type', width: 100, label: '任务类型'},
        {prop: 'name', minWidth: 100, label: '名称', href: {
            url: (row) => {
              if (row.path) {
                return `/?path=${row.path}&highlight=${row.name}`
              }
            }
          }
        },
        {prop: 'progress', width: 200, label: '进度'},
      ]
    }
  },
  mounted() {
    if (this.$route.path.startsWith("/s/")) {
      return
    }
    if (this.$store.state.user.token)  {
      getTaskProgress().then(res => {
        this.dataList = res.data
        this.$emit('update:task-count', this.dataList.length > 0)
      })
    }
  },
  watch: {
    data(val) {
      if (val) {
        this.dataList = val
      }
    },
    message(msg) {
      if (this.monitor && msg.event === 'msg/taskCountChange') {
        this.dataList = msg.data
      } else {
        if (msg.event === 'msg/taskProgress') {
          const taskProgress = msg.data.body
          const index = this.dataList.findIndex(item => item.taskId === taskProgress.taskId)
          if (index > -1) {
            if (taskProgress.progress) {
              this.dataList[index].progress = taskProgress.progress
            } else {
              this.dataList.splice(index, 1)
              this.$store.dispatch('updateMessage', { event: 'msg/taskCountChange', data: this.dataList })
            }
          } else {
            if (taskProgress.progress) {
              this.dataList.push(taskProgress)
              this.$store.dispatch('updateMessage', { event: 'msg/taskCountChange', data: this.dataList })
            }
          }
        }
      }
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.container {
  padding: 0 !important;
}
</style>
