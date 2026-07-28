import sys
import re

path = r"d:\Data_NK\Project5\AI\LIM_System_Linux_OK\frontend\src\App.jsx"
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"  const getMenuByPath = \(p\) => \{[\s\S]*?  \};"

new_block = """  const getMenuByPath = (p) => {
    let result = null;
    const searchMenu = (menuList) => {
      for (const m of menuList) {
        if (m.path) {
          const mp = m.path.startsWith("/") ? m.path : `/${m.path}`;
          if (mp === p) {
            result = m;
            return;
          }
        }
        if (m.children && m.children.length > 0) {
          searchMenu(m.children);
        }
      }
    };
    if (menus && menus.length > 0) {
      searchMenu(menus);
    }
    return result;
  };"""

if re.search(pattern, content):
    content = re.sub(pattern, new_block, content, count=1)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced using regex.")
else:
    print("Old block not found with regex.")
