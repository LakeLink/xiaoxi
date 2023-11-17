exports.config = {
    post: {
        topics: [{
            label: "所有话题",
            value: 0
        }, {
            label: "三行诗大赛",
            value: 1
        }, {
            label: "吹水",
            value: 2
        }, {
            label: "「唐人」街",
            value: 3
        }],
        defaultTopicValue: 0,
        sorters: [{
            label: "最新发布",
            value: 0
        }],
        defaultSorterValue: 0,
        visibilities: [{
                label: "所有人",
                value: 0,
            },
            {
                label: "认证用户",
                value: 1
            },
            {
                label: "同学",
                value: 2
            },
            {
                label: "教职工",
                value: 3
            }
        ],
        defaultVisibilityValue: 0
    }
}
exports.get = async (event, context) => {
    return exports.config
}