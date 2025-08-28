package com.yourcompany.workbench.ui

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.yourcompany.workbench.R
import com.yourcompany.workbench.model.WorkbenchItem
import com.yourcompany.workbench.adapter.WorkbenchGridAdapter

class FeishuStyleFragment : Fragment() {
    
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: WorkbenchGridAdapter
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        return inflater.inflate(R.layout.fragment_feishu_style, container, false)
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        setupRecyclerView()
        loadWorkbenchItems()
    }
    
    private fun setupRecyclerView() {
        recyclerView = view?.findViewById(R.id.workbench_grid)!!
        adapter = WorkbenchGridAdapter { item ->
            // 点击处理 - 打开对应的H5页面
            openH5Page(item)
        }
        
        recyclerView.apply {
            layoutManager = GridLayoutManager(context, 4) // 4列网格
            adapter = this@FeishuStyleFragment.adapter
        }
    }
    
    private fun loadWorkbenchItems() {
        val items = listOf(
            WorkbenchItem(
                id = "documents",
                name = "文档",
                icon = R.drawable.ic_documents,
                color = "#1890FF",
                url = "http://localhost:8002/documents"
            ),
            WorkbenchItem(
                id = "checkin",
                name = "打卡",
                icon = R.drawable.ic_checkin,
                color = "#52C41A",
                url = "http://localhost:8002/checkin"
            ),
            WorkbenchItem(
                id = "calendar",
                name = "日历",
                icon = R.drawable.ic_calendar,
                color = "#722ED1",
                url = "http://localhost:8002/calendar"
            ),
            WorkbenchItem(
                id = "chat",
                name = "聊天",
                icon = R.drawable.ic_chat,
                color = "#FA8C16",
                url = "http://localhost:8002/chat"
            ),
            WorkbenchItem(
                id = "tasks",
                name = "任务",
                icon = R.drawable.ic_tasks,
                color = "#F5222D",
                url = "http://localhost:8002/tasks"
            ),
            WorkbenchItem(
                id = "meeting",
                name = "会议",
                icon = R.drawable.ic_meeting,
                color = "#13C2C2",
                url = "http://localhost:8002/meeting"
            ),
            WorkbenchItem(
                id = "drive",
                name = "云盘",
                icon = R.drawable.ic_drive,
                color = "#2F54EB",
                url = "http://localhost:8002/drive"
            ),
            WorkbenchItem(
                id = "approval",
                name = "审批",
                icon = R.drawable.ic_approval,
                color = "#EB2F96",
                url = "http://localhost:8002/approval"
            ),
            WorkbenchItem(
                id = "report",
                name = "报表",
                icon = R.drawable.ic_report,
                color = "#FA541C",
                url = "http://localhost:8002/report"
            ),
            WorkbenchItem(
                id = "hr",
                name = "人事",
                icon = R.drawable.ic_hr,
                color = "#A0D911",
                url = "http://localhost:8002/hr"
            ),
            WorkbenchItem(
                id = "finance",
                name = "财务",
                icon = R.drawable.ic_finance,
                color = "#722ED1",
                url = "http://localhost:8002/finance"
            ),
            WorkbenchItem(
                id = "settings",
                name = "设置",
                icon = R.drawable.ic_settings,
                color = "#8C8C8C",
                url = "http://localhost:8002/settings"
            )
        )
        
        adapter.submitList(items)
    }
    
    private fun openH5Page(item: WorkbenchItem) {
        // 打开WebView显示H5内容
        val webViewFragment = WebViewFragment.newInstance(item.url, item.name)
        parentFragmentManager.beginTransaction()
            .replace(R.id.nav_host_fragment, webViewFragment)
            .addToBackStack(null)
            .commit()
    }
}
