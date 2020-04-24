============================
reStructuredText with Sphinx
============================
.. class:: no-web no-pdf

    |npm| |build| |test| |coverage| |vulnerabilities|

.. |npm| image:: https://img.shields.io/npm/v/@passoa/cxb
    :target: https://www.npmjs.com/package/@passoa/cxb
    :alt: npm
.. |build| image:: https://img.shields.io/azure-devops/build/passoa/cxb/33
    :target: https://dev.azure.com/passoa/cxb/_build/latest?definitionId=33
    :alt: Azure DevOps tests
.. |test| image:: https://img.shields.io/azure-devops/tests/passoa/cxb/33
    :target: https://dev.azure.com/passoa/cxb/_build/latest?definitionId=33
    :alt: Azure DevOps tests
.. |coverage| image:: https://img.shields.io/azure-devops/coverage/passoa/cxb/33   
    :target: https://dev.azure.com/passoa/cxb/_build/latest?definitionId=33
    :alt: Azure DevOps tests
.. |vulnerabilities| image:: https://img.shields.io/snyk/vulnerabilities/npm/@passoa/cxb
    :alt: Snyk Vulnerabilities for npm scoped package

-----------------
cxb
-----------------

个人自用的一个node扩展编译工具，它参考了 `cmake-js <https://github.com/cmake-js/cmake-js>`_ 的代码，目标是可以适配node和私有js引擎平台（如arm平台下的duktape，quickjs等）。cxb可以配合napi或者node-api-addon编译node扩展，也可以配合私有sdk编译arm下quickjs或duktape的cpp扩展。

-----------------
安装
-----------------


* 使用npm

     npm install @passoa/cxb

-----------------
帮助
-----------------

    cxb --help

-----------------
依赖要求
-----------------

* 安装 `cmake <http://www.cmake.org/download/>`_
* 安装 C/C++ 编译工具链

  - gcc
  - clang
  - msvc
  - mingw
  - 其他被cmake支持的编译工具链

-----------------
使用方法
-----------------

暂无，可以参考test/simple，它提供了一个简单的node-api-addon编译例子。

---------------------
文档（暂无）
---------------------

* `documentation <http://cxb.readTheDocs.org/>`_

-----
使用例子（暂无）
-----

* `example <https://github.com/pass0a/cxbtest>`_
