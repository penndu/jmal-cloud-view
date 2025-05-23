<template>
  <div class="container">
    <el-dialog class="dialog-form" width="600px" :title="dialogTitle" :visible.sync="dialogVisible">
      <el-form size="medium" ref="managerForm" label-width="90px"  :model="form" :rules="rules">
        <el-row :gutter="10">
          <el-col :sm="12">
            <el-form-item label="上级菜单:" prop="parentId">
              <tree-select
                ref="selectTree"
                placeholder="请选择上级菜单"
                :props="{value: 'id', label: 'name'}"
                :options="dataList"
                v-model="form.parentId"
                clearable
              />
            </el-form-item>
            <el-form-item label="菜单名称:" prop="name">
              <el-input placeholder="请输入菜单名称" v-model="form.name" />
            </el-form-item>
            <el-form-item label="菜单图标:" prop="icon">
              <icon-select v-model="form.icon"></icon-select>
            </el-form-item>
            <el-form-item label="路由地址:" prop="path">
              <el-input placeholder="请输入路由地址" v-model="form.path" />
            </el-form-item>
            <el-form-item label="组件路径:" prop="component">
              <el-input placeholder="请输入组件路径" v-model="form.component" />
            </el-form-item>
          </el-col>
          <el-col :sm="12">
            <el-form-item label="权限标识:" prop="authority">
              <el-select
                class="al-select"
                v-model="form.authority"
                placeholder="请选择权限标识"
                clearable
                :popper-append-to-body="false"
              >
                <el-option
                  v-for="item in authorityList"
                  :key="item"
                  :label="item"
                  :value="item">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="排序号:" prop="sortNumber">
              <el-input-number v-model="form.sortNumber" controls-position="right" :min="0"></el-input-number>
            </el-form-item>
            <el-form-item label="是否隐藏:" prop="hide">
              <el-radio v-model="form.hide" :label="false">显示</el-radio>
              <el-radio v-model="form.hide" :label="true">隐藏</el-radio>
            </el-form-item>
            <el-form-item label="菜单类型:" prop="menuType">
              <el-radio v-model="form.menuType" :label="0">菜单</el-radio>
              <el-radio v-model="form.menuType" :label="1">按钮</el-radio>
            </el-form-item>
            <el-form-item v-if="form.menuType !== 1" label="菜单位置:" prop="menuType">
              <el-radio-group v-model="form.menuType" size="mini">
                <el-radio-button :label="2">设置</el-radio-button>
                <el-radio-button :label="3">顶部</el-radio-button>
                <el-radio-button :label="4">右上</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button round size="small" @click="dialogVisible = false">取 消</el-button>
        <el-button round size="small" type="primary" :loading="updateLoading" @click.native.prevent="onSave()">保 存</el-button>
      </div>
    </el-dialog>
    <el-card class="box-card table-search-header">
      <div slot="header">
        <div class="box-card-header">
          <el-form size="medium" class="search-form" ref="queryForm" label-width="77px"  :model="queryCondition" :rules="rules">
            <el-row :gutter="10">
              <el-col :sm="12" :md="8">
                <el-form-item label="菜单名称:">
                  <el-input clearable placeholder="请输入" v-model="queryCondition.name" />
                </el-form-item>
              </el-col>
              <el-col :sm="12" :md="8">
                <el-form-item label="菜单地址:">
                  <el-input clearable placeholder="请输入" v-model="queryCondition.path" />
                </el-form-item>
              </el-col>
              <el-col :sm="12" :md="8">
                <div class="el-form-actions">
                  <el-button round class="card-btn-icon" size="medium" icon="el-icon-search" type="primary" @click="getMenuTree()">查询</el-button>
                  <el-button round class="card-btn-icon" size="medium" icon="el-icon-plus" type="primary" @click="add()">添加</el-button>
                  <el-button round class="card-btn-icon" size="medium" :icon="isExpand ? 'el-icon-remove-outline': 'el-icon-circle-plus-outline'" type="primary" @click="handleExpand()">{{isExpand ? "折叠" : "展开"}}</el-button>
                </div>
              </el-col>
            </el-row>
          </el-form>
        </div>
      </div>
      <table-list
        ref="tableMenu"
        :has-selection="false"
        :tableData="dataList"
        :less-client-height="210"
        :loading="loading"
        :tableHeader="tableHeader"
        :pagination="pagination"
        :is-expand.sync="isExpand"
        @pageChange="pageChange"
        @sizeChange="pageChange"
        @selectFun="selectFun"
        @sortChange="sortChange"
      ></table-list>
    </el-card>

  </div>
</template>

<script>
import menuApi from '@/api/menu'
import TableList from "@/components/table/TableList";
import TreeSelect from "@/components/select/tree";
import IconSelect from "@/components/select/icon";

export default {
    components: {
      IconSelect,
      TreeSelect,
      TableList
    },
    props: {
    },
    data() {
      return {
        title: "角色管理",
        dataList: [],
        authorityList: [],
        loading: false,
        dialogVisible: false,
        dialogTitle: '',
        updateLoading: false,
        valid: true,
        isExpand: false,
        form: {
          name: '',
          parentId: '',
          authority: '',
          path: '',
          component: '',
          icon: '',
          sortNumber: '',
          menuType: 0,
          hide: false,
        },
        // 分页信息
        pagination: {
          pageIndex: 1,
          pageSize: 15,
          pageTotal: 0
        },
        // 查询条件
        queryCondition: {
          name: '',
          code: '',
          remarks: '',
          sortProp: '',
          sortOrder: ''
        },
        tableHeader: [
          {prop: 'name', label: '菜单名称', noScope: true, align: 'left'},
          {prop: 'icon', label: '图标', icon: true, formatData: (icon)=> {return icon}, width: 50},
          {prop: 'path', label: '路由地址'},
          {prop: 'component', label: '组件路径'},
          {prop: 'authority', label: '权限标识'},
          {prop: 'sortNumber', label: '排序', width: 50},
          {prop: 'hide', label: '隐藏', width: 50,
            formatData: (hide)=> {
              if(hide){
                return '是'
              }else{
                return '否'
              }
            }
          },
          {prop: 'menuType', label: '类型', width: 100, tag: true,
            formatData: (menuType)=> {
              switch (menuType) {
                  case 0:
                   return [{name: '首页菜单'}]
                  case 1:
                    return [{name: '按钮'}]
                  case 2:
                    return [{name: '设置菜单'}]
                  case 3:
                    return [{name: '顶部菜单'}]
                  case 4:
                    return [{name: '右上角菜单'}]
              }
            }
          },
          // {prop: 'createTime', label: '创建时间'},
          {label: '操作', minWidth: this.$pc ? 0 : 130, active: [
              {name: '修改', icon: 'el-icon-edit', handle: (row) => this.handleEdit(row.id)},
              {name: '删除', icon: 'el-icon-delete', color: '#ff4d4f', handle: (row) => this.handleDelete([row.id])},
              ],
          },
        ],
        multipleSelection: [],
        rules: {
          name: [
            { required: true, message: '请输入菜单名称', trigger: 'blur' },
          ],
          sortNumber: [
            { required: true, message: '请输入排序号', trigger: 'blur' },
          ],
        },
        editMove: 1,// 1添加,2修改
      }
    },
    computed: {
    },
    mounted() {
      this.getMenuTree()
      this.getAuthorityList()
      this.resize()
    },
    methods: {
      resize(){
        let clientWidth = document.querySelector(".container").clientWidth
        const monbile = clientWidth <= 768;
      },
      // 组件选择完后把数据传过来
      selectFun(data) {
        this.multipleSelection = data.backData;
      },
      //表格组件返回排序对象
      sortChange(data) {
        let column = data.backData;
        this.queryCondition.sortProp = column.prop
        this.queryCondition.sortOrder = column.order
        this.getRoleList()
      },
      //分页导航
      pageChange(data) {
        this.pagination = data.backData;
        this.getMenuTree()
      },
      getAuthorityList() {
        menuApi.authorityList().then(res => {
          this.authorityList = res.data
        })
      },
      getMenuTree(){
        this.loading = true
        menuApi.menuTree({
          page: this.pagination.pageIndex,
          pageSize: this.pagination.pageSize,
          ...this.queryCondition
        }).then(res => {
          this.dataList = res.data
          this.pagination.pageTotal = res.count
          this.loading = false
        })
      },
      async add() {
        this.dialogVisible = true
        this.dialogTitle = '添加角色'
        this.editMove = 1
        await this.$nextTick()
        this.$refs.managerForm.resetFields()
        this.$refs.selectTree.clearHandle()
      },
      // 展开与折叠table
      handleExpand() {
        this.isExpand = !this.isExpand
        this.$refs.tableMenu.handleExpand()
      },
      // 设置formData
      setFormData() {
        let data = new FormData();
        for (let formKey in this.form) {
          if(this.form.hasOwnProperty(formKey)){
            data.append(formKey,this.form[formKey])
          }
        }
        data.delete("createTime")
        data.delete("updateTime")
        return data
      },
      // 保存
      onSave() {
        this.$refs.managerForm.validate((valid) => {
          this.valid = valid
          if (valid) {
            this.updateLoading = true
            if(this.editMove === 1){
              this.addMenu(this.setFormData())
            }
            if(this.editMove === 2){
              this.updateMenu(this.setFormData())
            }
          } else {
            return false;
          }
        });
      },
      handleEdit(id) {
        this.editMove = 2
        this.dialogVisible = true
        this.dialogTitle = '修改菜单'
        menuApi.menuInfo({menuId: id}).then(res => {
          this.form = res.data
        })
      },
      // 删除选中
      handleSelectDelete () {
        this.$confirm('确定要删除选中的角色吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          let ids = []
          this.multipleSelection.forEach(row => {
            ids.push(row.id)
          })
          this.deleteMenu(ids)
        })
      },
      handleDelete(ids) {
        this.$confirm('确定要删除吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.deleteMenu(ids)
        })
      },
      deleteMenu(ids){
        menuApi.delete({menuIds: ids}).then(() => {
          this.onSuccess('删除成功!')
        }).catch(() => {
          this.onError()
        })
      },
      // 修改用户信息操作
      updateMenu(data){
        menuApi.update(data).then(() => {
          this.onSuccess()
        }).catch(() => {
          this.onError()
        })
      },
      // 添加角色
      addMenu(data){
        menuApi.add(data).then(() => {
          this.onSuccess()
        }).catch(() => {
          this.onError()
        })
      },
      onSuccess(message){
        this.getMenuTree()
        let msg = '保存成功!'
        if(message){
          msg = message
        }
        this.updateLoading = false
        this.dialogVisible = false
        this.$message({
          message: msg,
          type: 'success',
          duration: 1000
        })
      },
      onError() {
        this.updateLoading = false
      }
    }
  }
</script>

<style lang="scss" scoped>
@import "src/styles/setting";
>>> .el-input {
  width: 100%;
}
>>> .el-input-number {
  width: unset;
}
>>> .el-select {
  width: 100%;
}
>>>.box-card {
  max-width: 1440px;
}
>>> .el-table .cell.el-tooltip {
  display: flex;
}
</style>
