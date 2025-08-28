package com.yourcompany.workbench.model

import androidx.annotation.DrawableRes

data class WorkbenchItem(
    val id: String,
    val name: String,
    @DrawableRes val icon: Int,
    val color: String,
    val url: String,
    val badge: Int = 0, // 未读消息数量
    val isNew: Boolean = false // 是否为新功能
)
