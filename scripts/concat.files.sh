#!/bin/bash
set -f  # 禁用 glob 扩展

# 用法: concat.files.sh file1 file2 file3 ... fileN
# 或者 在调用命令时禁用 globbing, 可以在命令前加上 noglob 前缀，例如：
#   noglob concat.files.sh file1 file2 file3 ... fileN
# 如果文件路径中包含特殊字符（如空格、(、) 等），请用引号传参。

if [ $# -lt 1 ]; then
    echo "Usage: ls $0 'file1' 'file2' [file3 ...]"
    exit 1
fi

# 输出重定向到 /tmp/merged.md
output_file="/tmp/merged.md"
> "$output_file"  # 清空文件内容

# 循环处理每个输入文件
for file in "$@"; do
    # 如果文件存在，则先生成转义后的文件名用于输出显示
    escaped_file=$(printf '%q' "$file")
    if [ -f "$file" ]; then
        echo "==> $escaped_file <==" >> "$output_file"
        echo '```' >> "$output_file"
        cat "$file" >> "$output_file"
        echo '```' >> "$output_file"
        echo "" >> "$output_file"  # 添加一个空行分隔
    else
        echo "Error: File '$file' not found." >&2
        exit 1
    fi
done
#echo '### 请基于以上设计文档 + 项目代码结构 + 主要代码片段, 给出完整代码修复方案. 但是务必`精简`:明确告知哪个文件的哪个部分需要什么样的修改. 务必对比当前代码,给出`关键修改点的代码`,尽量避免`冗余和重复`.' >> "$output_file"
echo "Files concatenated to: $output_file"
exit 0