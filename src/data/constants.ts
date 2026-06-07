export const INDUSTRIES = [
  '互联网/IT',
  '金融',
  '制造业',
  '教育/培训',
  '医疗/健康',
  '房地产/建筑',
  '消费品/零售',
  '汽车/新能源',
  '文化传媒',
  '物流/供应链'
];

export const PROVINCES = [
  { name: '北京', cities: ['北京'] },
  { name: '上海', cities: ['上海'] },
  { name: '广东', cities: ['广州', '深圳', '东莞', '佛山'] },
  { name: '浙江', cities: ['杭州', '宁波', '温州'] },
  { name: '江苏', cities: ['南京', '苏州', '无锡', '常州'] },
  { name: '四川', cities: ['成都', '绵阳'] },
  { name: '湖北', cities: ['武汉', '宜昌'] },
  { name: '陕西', cities: ['西安'] },
  { name: '福建', cities: ['福州', '厦门', '泉州'] },
  { name: '山东', cities: ['济南', '青岛', '烟台'] },
  { name: '湖南', cities: ['长沙'] },
  { name: '河南', cities: ['郑州', '洛阳'] },
  { name: '安徽', cities: ['合肥'] },
  { name: '重庆', cities: ['重庆'] },
  { name: '天津', cities: ['天津'] },
  { name: '辽宁', cities: ['沈阳', '大连'] },
  { name: '河北', cities: ['石家庄', '保定'] },
  { name: '江西', cities: ['南昌'] },
  { name: '云南', cities: ['昆明'] },
  { name: '山西', cities: ['太原'] },
  { name: '广西', cities: ['南宁'] },
  { name: '贵州', cities: ['贵阳'] },
  { name: '黑龙江', cities: ['哈尔滨'] },
  { name: '吉林', cities: ['长春'] },
  { name: '内蒙古', cities: ['呼和浩特'] },
  { name: '新疆', cities: ['乌鲁木齐'] },
  { name: '甘肃', cities: ['兰州'] },
  { name: '海南', cities: ['海口', '三亚'] },
  { name: '宁夏', cities: ['银川'] },
  { name: '青海', cities: ['西宁'] },
  { name: '西藏', cities: ['拉萨'] }
];

export const EDUCATIONS = ['博士', '硕士', '本科', '大专', '高中及以下'];

export const EXPERIENCES = [
  '应届生',
  '1-3年',
  '3-5年',
  '5-10年',
  '10年以上'
];

export const REGIONS = [
  { id: 'north', name: '华北', provinces: ['北京', '天津', '河北', '山西', '内蒙古'] },
  { id: 'east', name: '华东', provinces: ['上海', '江苏', '浙江', '安徽', '福建', '江西', '山东'] },
  { id: 'south', name: '华南', provinces: ['广东', '广西', '海南'] },
  { id: 'central', name: '华中', provinces: ['河南', '湖北', '湖南'] },
  { id: 'southwest', name: '西南', provinces: ['重庆', '四川', '贵州', '云南', '西藏'] },
  { id: 'northwest', name: '西北', provinces: ['陕西', '甘肃', '青海', '宁夏', '新疆'] },
  { id: 'northeast', name: '东北', provinces: ['辽宁', '吉林', '黑龙江'] }
];

export const JOB_TITLES = [
  'Java开发工程师',
  '前端开发工程师',
  'Python开发工程师',
  '算法工程师',
  '数据分析师',
  '产品经理',
  'UI设计师',
  '运营经理',
  '市场营销',
  '人力资源专员',
  '财务分析师',
  '销售经理',
  '客户成功经理',
  '测试工程师',
  'DevOps工程师'
];

export const UNIVERSITIES = [
  { name: '清华大学', city: '北京', province: '北京', majors: ['计算机科学与技术', '软件工程', '电子信息', '自动化', '经济管理'], tier: 'top' },
  { name: '北京大学', city: '北京', province: '北京', majors: ['计算机科学与技术', '软件工程', '数学', '金融学', '工商管理'], tier: 'top' },
  { name: '复旦大学', city: '上海', province: '上海', majors: ['计算机科学与技术', '软件工程', '金融学', '新闻传播', '工商管理'], tier: 'top' },
  { name: '上海交通大学', city: '上海', province: '上海', majors: ['计算机科学与技术', '软件工程', '电子信息', '机械工程', '经济管理'], tier: 'top' },
  { name: '浙江大学', city: '杭州', province: '浙江', majors: ['计算机科学与技术', '软件工程', '电子信息', '机械工程', '工商管理'], tier: 'top' },
  { name: '南京大学', city: '南京', province: '江苏', majors: ['计算机科学与技术', '软件工程', '数学', '金融学', '工商管理'], tier: '985' },
  { name: '中国科学技术大学', city: '合肥', province: '安徽', majors: ['计算机科学与技术', '软件工程', '数学', '物理', '电子信息'], tier: 'top' },
  { name: '武汉大学', city: '武汉', province: '湖北', majors: ['计算机科学与技术', '软件工程', '金融学', '法学', '新闻传播'], tier: '985' },
  { name: '华中科技大学', city: '武汉', province: '湖北', majors: ['计算机科学与技术', '软件工程', '电子信息', '机械工程', '医学'], tier: '985' },
  { name: '西安交通大学', city: '西安', province: '陕西', majors: ['计算机科学与技术', '软件工程', '电子信息', '机械工程', '工商管理'], tier: '985' },
  { name: '哈尔滨工业大学', city: '哈尔滨', province: '黑龙江', majors: ['计算机科学与技术', '软件工程', '电子信息', '机械工程', '土木工程'], tier: '985' },
  { name: '中山大学', city: '广州', province: '广东', majors: ['计算机科学与技术', '软件工程', '金融学', '医学', '工商管理'], tier: '985' },
  { name: '华南理工大学', city: '广州', province: '广东', majors: ['计算机科学与技术', '软件工程', '电子信息', '化学工程', '材料科学'], tier: '985' },
  { name: '四川大学', city: '成都', province: '四川', majors: ['计算机科学与技术', '软件工程', '医学', '金融学', '工商管理'], tier: '985' },
  { name: '同济大学', city: '上海', province: '上海', majors: ['计算机科学与技术', '软件工程', '土木工程', '建筑学', '车辆工程'], tier: '985' },
  { name: '北京航空航天大学', city: '北京', province: '北京', majors: ['计算机科学与技术', '软件工程', '电子信息', '航空航天工程', '自动化'], tier: '985' },
  { name: '东南大学', city: '南京', province: '江苏', majors: ['计算机科学与技术', '软件工程', '电子信息', '建筑学', '土木工程'], tier: '985' },
  { name: '厦门大学', city: '厦门', province: '福建', majors: ['计算机科学与技术', '软件工程', '金融学', '会计', '工商管理'], tier: '985' },
  { name: '北京邮电大学', city: '北京', province: '北京', majors: ['计算机科学与技术', '软件工程', '电子信息', '通信工程', '信息安全'], tier: '211' },
  { name: '电子科技大学', city: '成都', province: '四川', majors: ['计算机科学与技术', '软件工程', '电子信息', '通信工程', '自动化'], tier: '985' }
];

export const ENTERPRISES = [
  { id: 'e1', name: '字节跳动', region: 'north', cities: ['北京', '上海', '深圳', '杭州'] },
  { id: 'e2', name: '阿里巴巴', region: 'east', cities: ['杭州', '北京', '上海', '深圳', '成都'] },
  { id: 'e3', name: '腾讯科技', region: 'south', cities: ['深圳', '北京', '上海', '广州', '成都'] },
  { id: 'e4', name: '美团点评', region: 'north', cities: ['北京', '上海', '深圳'] },
  { id: 'e5', name: '京东集团', region: 'north', cities: ['北京', '上海', '深圳', '成都'] },
  { id: 'e6', name: '百度', region: 'north', cities: ['北京', '上海', '深圳'] },
  { id: 'e7', name: '网易', region: 'east', cities: ['杭州', '广州', '北京', '上海'] },
  { id: 'e8', name: '小米科技', region: 'north', cities: ['北京', '深圳', '南京'] }
];

export const CHANNELS = [
  'BOSS直聘',
  '猎聘',
  '智联招聘',
  '前程无忧',
  'LinkedIn领英',
  '脉脉',
  '校园招聘',
  '内部推荐',
  '猎头渠道'
];
