package com.yourcompany.workbench.adapter

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.yourcompany.workbench.R
import com.yourcompany.workbench.model.WorkbenchItem

class WorkbenchGridAdapter(
    private val onItemClick: (WorkbenchItem) -> Unit
) : ListAdapter<WorkbenchItem, WorkbenchGridAdapter.ViewHolder>(WorkbenchDiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_workbench_grid, parent, false)
        return ViewHolder(view, onItemClick)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ViewHolder(
        itemView: View,
        private val onItemClick: (WorkbenchItem) -> Unit
    ) : RecyclerView.ViewHolder(itemView) {
        
        private val iconView: ImageView = itemView.findViewById(R.id.workbench_icon)
        private val nameView: TextView = itemView.findViewById(R.id.workbench_name)
        private val badgeView: TextView = itemView.findViewById(R.id.workbench_badge)
        private val newIndicator: View = itemView.findViewById(R.id.new_indicator)
        
        fun bind(item: WorkbenchItem) {
            iconView.setImageResource(item.icon)
            nameView.text = item.name
            
            // 设置图标背景色
            try {
                val color = Color.parseColor(item.color)
                iconView.setColorFilter(color)
            } catch (e: Exception) {
                // 使用默认颜色
                iconView.setColorFilter(Color.parseColor("#1890FF"))
            }
            
            // 显示未读消息数量
            if (item.badge > 0) {
                badgeView.visibility = View.VISIBLE
                badgeView.text = if (item.badge > 99) "99+" else item.badge.toString()
            } else {
                badgeView.visibility = View.GONE
            }
            
            // 显示新功能标识
            newIndicator.visibility = if (item.isNew) View.VISIBLE else View.GONE
            
            itemView.setOnClickListener {
                onItemClick(item)
            }
        }
    }
    
    private class WorkbenchDiffCallback : DiffUtil.ItemCallback<WorkbenchItem>() {
        override fun areItemsTheSame(oldItem: WorkbenchItem, newItem: WorkbenchItem): Boolean {
            return oldItem.id == newItem.id
        }
        
        override fun areContentsTheSame(oldItem: WorkbenchItem, newItem: WorkbenchItem): Boolean {
            return oldItem == newItem
        }
    }
}
