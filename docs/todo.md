- Node Fest 2016準備
    - chooのセットアップ
- Test
    - TODO List App
        - Back
            - infra
                - docker on mongodb
            - expressにおけるsigninの仕組みを調べる
                - user session
                    - mongoに格納
        - Front
            - choo
    - routes
        - todos
            - index
                - 0件 200
                - 上位30件だけが帰ってくる
                    - DBのクエリ
                - ~~product codeへ分離~~
                - ~~promise化~~
                    - mongooseのpromiseを調べる
                - modelのinitの仕組み
            - show
            - create
            - update
            - delete
        - users
            - show
            - create
            - update
            - signin / signout
    - lib
        - middleware
        - util
