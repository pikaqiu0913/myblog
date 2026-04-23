-- ============================================
-- 个人网站数据库初始化脚本
-- MySQL 8.0
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- 用户表
-- ----------------------------
CREATE TABLE IF NOT EXISTS users (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL COMMENT 'bcrypt 哈希',
    display_name    VARCHAR(100),
    avatar_url      VARCHAR(500),
    role            VARCHAR(20) DEFAULT 'admin' COMMENT 'admin/editor',
    is_active       BOOLEAN DEFAULT TRUE,
    last_login_at   DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 个人简介表
-- ----------------------------
CREATE TABLE IF NOT EXISTS profile (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    real_name           VARCHAR(100) NOT NULL COMMENT '真实姓名',
    nick_name           VARCHAR(100) COMMENT '昵称/英文名',
    motto               VARCHAR(255) COMMENT '个人格言/签名',
    bio                 LONGTEXT COMMENT '详细介绍（Markdown）',
    bio_html            LONGTEXT COMMENT '渲染后的 HTML',
    birth_date          DATE COMMENT '出生日期',
    location            VARCHAR(200) COMMENT '所在地',
    email_public        VARCHAR(255) COMMENT '对外展示邮箱',
    phone_public        VARCHAR(50) COMMENT '对外展示电话（可选）',
    github_url          VARCHAR(500),
    linkedin_url        VARCHAR(500),
    wechat_qr_url       VARCHAR(500) COMMENT '微信二维码（可选）',
    avatar_media_id     INT COMMENT '头像图片（关联 media 表）',
    resume_url          VARCHAR(500) COMMENT '简历下载链接',
    is_public           BOOLEAN DEFAULT TRUE COMMENT '是否对外展示',
    view_count          INT DEFAULT 0,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 教育经历表
-- ----------------------------
CREATE TABLE IF NOT EXISTS education (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    school_name     VARCHAR(200) NOT NULL COMMENT '学校名称',
    major           VARCHAR(100) COMMENT '专业',
    degree          VARCHAR(50) COMMENT '学位：本科/硕士/博士',
    start_date      DATE NOT NULL,
    end_date        DATE COMMENT 'NULL 表示在读',
    is_current      BOOLEAN DEFAULT FALSE,
    description     TEXT COMMENT '经历描述（Markdown）',
    sort_order      INT DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 生活相册分类表
-- ----------------------------
CREATE TABLE IF NOT EXISTS photo_albums (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL COMMENT '相册名称',
    slug            VARCHAR(100) UNIQUE NOT NULL COMMENT 'URL 标识',
    description     VARCHAR(500),
    cover_media_id  INT COMMENT '封面图片',
    sort_order      INT DEFAULT 0,
    is_public       BOOLEAN DEFAULT TRUE COMMENT '是否对外展示',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 家庭成员表
-- ----------------------------
CREATE TABLE IF NOT EXISTS family_members (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL COMMENT '姓名',
    relation        VARCHAR(50) NOT NULL COMMENT '关系：父亲/母亲/配偶/子女等',
    avatar_media_id INT COMMENT '头像照片',
    bio             LONGTEXT COMMENT '成员介绍（Markdown）',
    bio_html        LONGTEXT COMMENT '渲染后的 HTML',
    birth_date      DATE COMMENT '出生日期（可选）',
    hobbies         VARCHAR(500) COMMENT '兴趣爱好 JSON',
    sort_order      INT DEFAULT 0,
    is_public       BOOLEAN DEFAULT TRUE COMMENT '是否对外展示',
    view_count      INT DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_relation (relation),
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 家庭成员照片关联表
-- ----------------------------
CREATE TABLE IF NOT EXISTS family_member_photos (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    family_member_id    INT NOT NULL,
    media_id            INT NOT NULL,
    caption             VARCHAR(255) COMMENT '照片说明',
    sort_order          INT DEFAULT 0,
    created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE,
    INDEX idx_member (family_member_id),
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 博客分类表
-- ----------------------------
CREATE TABLE IF NOT EXISTS categories (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(50) NOT NULL,
    slug            VARCHAR(50) UNIQUE NOT NULL COMMENT 'URL 友好标识',
    description     VARCHAR(500),
    sort_order      INT DEFAULT 0,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 博客文章表
-- ----------------------------
CREATE TABLE IF NOT EXISTS articles (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(255) UNIQUE NOT NULL,
    summary         VARCHAR(500),
    content         LONGTEXT NOT NULL COMMENT 'Markdown 格式',
    html_content    LONGTEXT COMMENT '渲染后的 HTML',
    cover_media_id  INT COMMENT '封面图片（关联 media 表）',
    category_id     INT,
    author_id       INT,
    status          VARCHAR(20) DEFAULT 'draft' COMMENT 'draft/published/archived',
    view_count      INT DEFAULT 0,
    is_top          BOOLEAN DEFAULT FALSE COMMENT '置顶',
    meta_keywords   VARCHAR(255),
    meta_description VARCHAR(255),
    published_at    DATETIME,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status_published (status, published_at),
    INDEX idx_category (category_id),
    FULLTEXT INDEX ft_title_summary (title, summary) WITH PARSER ngram
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 媒体文件表
-- ----------------------------
CREATE TABLE IF NOT EXISTS media (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    original_name   VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_name       VARCHAR(255) NOT NULL COMMENT '存储文件名（UUID）',
    file_path       VARCHAR(500) NOT NULL COMMENT '相对存储路径',
    file_url        VARCHAR(500) NOT NULL COMMENT '访问 URL',
    mime_type       VARCHAR(100) NOT NULL COMMENT 'image/jpeg, image/png 等',
    file_size       BIGINT NOT NULL COMMENT '字节数',
    width           INT COMMENT '图片宽度',
    height          INT COMMENT '图片高度',
    alt_text        VARCHAR(255) COMMENT '替代文本',
    description     VARCHAR(500),
    module_type     VARCHAR(50) NOT NULL COMMENT '来源模块',
    ref_id          INT COMMENT '关联记录 ID',
    is_public       BOOLEAN DEFAULT TRUE COMMENT '是否允许外部直接访问',
    uploaded_by     INT COMMENT '上传者',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_module (module_type, ref_id),
    INDEX idx_mime (mime_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 网站配置表
-- ----------------------------
CREATE TABLE IF NOT EXISTS site_configs (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    config_key      VARCHAR(100) UNIQUE NOT NULL,
    config_value    JSON NOT NULL,
    description     VARCHAR(255),
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 访问日志表
-- ----------------------------
CREATE TABLE IF NOT EXISTS access_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    ip_address      VARCHAR(45) NOT NULL COMMENT 'IPv4/IPv6',
    user_agent      VARCHAR(500),
    request_path    VARCHAR(500) NOT NULL,
    request_method  VARCHAR(10) NOT NULL,
    response_status INT,
    request_headers LONGTEXT COMMENT '请求头快照 JSON',
    fingerprint     VARCHAR(64) COMMENT '浏览器指纹哈希',
    is_suspected_bot BOOLEAN DEFAULT FALSE COMMENT '疑似爬虫标记',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_created (ip_address, created_at),
    INDEX idx_fingerprint (fingerprint),
    INDEX idx_created (created_at),
    INDEX idx_bot (is_suspected_bot, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 朋友名片表
-- ----------------------------
CREATE TABLE IF NOT EXISTS friend_members (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL COMMENT '姓名',
    category        VARCHAR(50) NOT NULL COMMENT '分类: high_school/undergraduate/internship',
    avatar_media_id INT COMMENT '头像照片（关联 media 表）',
    bio             LONGTEXT COMMENT '简介（Markdown）',
    bio_html        LONGTEXT COMMENT '渲染后的 HTML',
    sort_order      INT DEFAULT 0,
    is_public       BOOLEAN DEFAULT TRUE,
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_fm_category (category),
    INDEX idx_fm_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 留言板表
-- ----------------------------
CREATE TABLE IF NOT EXISTS guestbook_messages (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nickname        VARCHAR(100) NOT NULL COMMENT '昵称',
    content         LONGTEXT NOT NULL COMMENT '留言内容',
    contact         VARCHAR(255) COMMENT '联系方式（可选）',
    ip_address      VARCHAR(45) COMMENT 'IP 地址',
    fingerprint     VARCHAR(64) COMMENT '浏览器指纹',
    is_public       BOOLEAN DEFAULT TRUE COMMENT '是否展示',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_gb_public (is_public, created_at),
    INDEX idx_gb_ip (ip_address, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- 爬虫封禁记录表
-- ----------------------------
CREATE TABLE IF NOT EXISTS bot_blocks (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ip_address      VARCHAR(45) NOT NULL,
    fingerprint     VARCHAR(64),
    block_reason    VARCHAR(50) NOT NULL COMMENT 'rate_limit/captcha_fail/behavior/manual',
    evidence        LONGTEXT COMMENT '触发封禁的证据 JSON',
    expires_at      DATETIME NOT NULL COMMENT '自动解封时间',
    created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip (ip_address),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
