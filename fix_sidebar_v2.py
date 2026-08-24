import os

files = [
    'account-center.html',
    'account-realname.html',
    'account-security.html',
    'account-permission.html',
    'account-billing.html',
]

for fname in files:
    path = os.path.join('/workspace', fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace :has() CSS with .has-active class
    old_has = """    /* Parent menu highlight when child is active */
    .sidebar-item:has(.sidebar-submenu .sidebar-link.active) > .sidebar-link {
      color: var(--brand-primary);
      background: var(--brand-primary-50);
      font-weight: 600;
      border-right: 3px solid var(--brand-primary);
    }

    .sidebar-item:has(.sidebar-submenu .sidebar-link.active) > .sidebar-link .sidebar-arrow {
      transform: rotate(180deg);
    }"""

    new_has = """    /* Parent menu highlight when child is active */
    .sidebar-item.has-active > .sidebar-link {
      color: var(--brand-primary);
      background: var(--brand-primary-50);
      font-weight: 600;
      border-right: 3px solid var(--brand-primary);
    }

    .sidebar-item.has-active > .sidebar-link .sidebar-arrow {
      transform: rotate(90deg);
    }"""

    content = content.replace(old_has, new_has)

    # 2. Fix JS arrow rotation: 180deg -> 90deg
    content = content.replace(
        "arrow.style.transform = parent.classList.contains('open') ? 'rotate(180deg)' : 'rotate(0deg)';",
        "arrow.style.transform = parent.classList.contains('open') ? 'rotate(90deg)' : 'rotate(0deg)';"
    )

    # 3. Add dynamic highlight on page load (before sidebar parent menu expand/collapse block)
    old_sidebar_js = """      // Sidebar parent menu expand/collapse
      document.querySelectorAll('.sidebar-item > .sidebar-link').forEach(function(link) {"""

    new_sidebar_js = """      // Dynamic parent highlight based on active child
      document.querySelectorAll('.sidebar-item').forEach(function(item) {
        if (item.querySelector('.sidebar-submenu .sidebar-link.active')) {
          item.classList.add('has-active');
          var arrow = item.querySelector('.sidebar-arrow');
          if (arrow) arrow.style.transform = 'rotate(90deg)';
        }
      });

      // Sidebar parent menu expand/collapse
      document.querySelectorAll('.sidebar-item > .sidebar-link').forEach(function(link) {"""

    content = content.replace(old_sidebar_js, new_sidebar_js)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Updated {fname}")
