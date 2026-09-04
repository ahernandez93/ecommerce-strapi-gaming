const allowedMediaTypes = [
    "image/*",
    "video/*",
    "audio/*",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.*",
    "text/plain",
    "text/csv",
];

const deniedTypes = [
    "image/svg+xml",
    "application/vnd.microsoft.portable-executable",
    "application/x-msdownload",
    "application/x-msdos-program",
    "application/x-executable",
    "application/x-dosexec",
    "application/x-sh",
    "text/x-shellscript",
    "application/x-mach-binary",
];

module.exports = ({ env }) => ({
    "users-permissions": {
        config: {
            jwtManagement: "refresh",
            sessions: {
                httpOnly: true,
            },
        },
    },
    upload: {
        config: {
            provider: "aws-s3",
            providerOptions: {
                s3Options: {
                    credentials: {
                        accessKeyId: env("AWS_ACCESS_KEY_ID"),
                        secretAccessKey: env("AWS_ACCESS_SECRET"),
                    },
                    region: env("AWS_REGION"),
                    params: {
                        ACL: env("AWS_ACL", "public-read"),
                        Bucket: env("AWS_BUCKET"),
                    },
                },
            },
            actionOptions: {
                upload: {},
                uploadStream: {},
                delete: {},
            },
        },
    },
});
