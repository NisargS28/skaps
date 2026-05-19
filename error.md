Frontend error
[browser] ⨯ unhandledRejection: TypeError: Failed to fetch
    at Home[useEffect()] (file://D:/Nisarg.Doc/Skaps/chatbot/.next/dev/static/chunks/src_121es7o._.js:1723:21)
[browser] ⨯ unhandledRejection: TypeError: Failed to fetch
    at Home[handleSendMessage] (file://D:/Nisarg.Doc/Skaps/chatbot/.next/dev/static/chunks/src_121es7o._.js:1791:23)
    at ChatWindow[suggestions.map() > <button>.onClick] (file://D:/Nisarg.Doc/Skaps/chatbot/.next/dev/static/chunks/src_121es7o._.js:1395:101)
Backend Error
INFO:     127.0.0.1:64718 - "POST /api/chat/sessions/2/messages HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1967, in _exec_single_context
    self.dialect.do_execute(
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\default.py", line 952, in do_execute
    cursor.execute(statement, parameters)
psycopg2.errors.UndefinedColumn: column "role" of relation "chat_messages" does not exist
LINE 1: INSERT INTO chat_messages (session_id, role, content, create...
                                               ^


The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 415, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 56, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\applications.py", line 1159, in __call__
    await super().__call__(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\applications.py", line 90, in __call__
    await self.middleware_stack(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\middleware\cors.py", line 96, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)    
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\middleware\cors.py", line 154, in simple_response
    await self.app(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)     
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\routing.py", line 660, in __call__
    await self.middleware_stack(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\routing.py", line 680, in app
    await route.handle(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\routing.py", line 276, in handle
    await self.app(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\routing.py", line 134, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)       
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\routing.py", line 120, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\routing.py", line 674, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\routing.py", line 330, in run_endpoint_function
    return await run_in_threadpool(dependant.call, **values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\concurrency.py", line 32, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\anyio\to_thread.py", line 63, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2518, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 1002, in run
    result = context.run(func, *args)
             ^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\app\routes\chat.py", line 69, in add_chat_message
    db.commit()
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\session.py", line 2030, in commit
    trans.commit(_to_root=True)
  File "<string>", line 2, in commit
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\state_changes.py", line 137, in _go
    ret_value = fn(self, *arg, **kw)
                ^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\session.py", line 1311, in commit
    self._prepare_impl()
  File "<string>", line 2, in _prepare_impl
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\state_changes.py", line 137, in _go
    ret_value = fn(self, *arg, **kw)
                ^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\session.py", line 1286, in _prepare_impl
    self.session.flush()
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\session.py", line 4331, in flush
    self._flush(objects)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\session.py", line 4466, in _flush
    with util.safe_reraise():
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\util\langhelpers.py", line 121, in __exit__
    raise exc_value.with_traceback(exc_tb)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\session.py", line 4427, in _flush
    flush_context.execute()
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\unitofwork.py", line 466, in execute
    rec.execute(self)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\unitofwork.py", line 642, in execute
    util.preloaded.orm_persistence.save_obj(
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\persistence.py", line 93, in save_obj
    _emit_insert_statements(
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\persistence.py", line 1233, in _emit_insert_statements
    result = connection.execute(
             ^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1419, in execute
    return meth(
           ^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\sql\elements.py", line 527, in _execute_on_connection
    return connection._execute_clauseelement(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1641, in _execute_clauseelement
    ret = self._execute_context(
          ^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1846, in _execute_context
    return self._exec_single_context(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1986, in _exec_single_context
    self._handle_dbapi_exception(
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 2363, in _handle_dbapi_exception
    raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1967, in _exec_single_context
    self.dialect.do_execute(
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\default.py", line 952, in do_execute
    cursor.execute(statement, parameters)
sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedColumn) column "role" of relation "chat_messages" does not exist
LINE 1: INSERT INTO chat_messages (session_id, role, content, create...
                                               ^

[SQL: INSERT INTO chat_messages (session_id, role, content, created_at) VALUES (%(session_id)s, %(role)s, %(content)s, %(created_at)s) RETURNING chat_messages.id]
[parameters: {'session_id': 2, 'role': 'user', 'content': 'Export rules', 'created_at': datetime.datetime(2026, 5, 19, 11, 47, 2, 135506)}]
(Background on this error at: https://sqlalche.me/e/20/f405)
INFO:     127.0.0.1:54588 - "GET /api/chat/sessions/2/messages HTTP/1.1" 500 Internal Server Error
ERROR:    Exception in ASGI application
Traceback (most recent call last):
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1967, in _exec_single_context
    self.dialect.do_execute(
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\default.py", line 952, in do_execute
    cursor.execute(statement, parameters)
psycopg2.errors.UndefinedColumn: column chat_messages.role does not exist        
LINE 1: ..._messages.session_id AS chat_messages_session_id, chat_messa...       
                                                             ^


The above exception was the direct cause of the following exception:

Traceback (most recent call last):
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\uvicorn\protocols\http\h11_impl.py", line 415, in run_asgi
    result = await app(  # type: ignore[func-returns-value]
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\uvicorn\middleware\proxy_headers.py", line 56, in __call__
    return await self.app(scope, receive, send)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\applications.py", line 1159, in __call__
    await super().__call__(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\applications.py", line 90, in __call__
    await self.middleware_stack(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 186, in __call__
    raise exc
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\middleware\errors.py", line 164, in __call__
    await self.app(scope, receive, _send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\middleware\cors.py", line 96, in __call__
    await self.simple_response(scope, receive, send, request_headers=headers)    
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\middleware\cors.py", line 154, in simple_response
    await self.app(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\middleware\exceptions.py", line 63, in __call__
    await wrap_app_handling_exceptions(self.app, conn)(scope, receive, send)     
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\middleware\asyncexitstack.py", line 18, in __call__
    await self.app(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\routing.py", line 660, in __call__
    await self.middleware_stack(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\routing.py", line 680, in app
    await route.handle(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\routing.py", line 276, in handle
    await self.app(scope, receive, send)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\routing.py", line 134, in app
    await wrap_app_handling_exceptions(app, request)(scope, receive, send)       
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 53, in wrapped_app
    raise exc
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\_exception_handler.py", line 42, in wrapped_app
    await app(scope, receive, sender)
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\routing.py", line 120, in app
    response = await f(request)
               ^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\routing.py", line 674, in app
    raw_response = await run_endpoint_function(
                   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\fastapi\routing.py", line 330, in run_endpoint_function
    return await run_in_threadpool(dependant.call, **values)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\starlette\concurrency.py", line 32, in run_in_threadpool
    return await anyio.to_thread.run_sync(func)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\anyio\to_thread.py", line 63, in run_sync
    return await get_async_backend().run_sync_in_worker_thread(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 2518, in run_sync_in_worker_thread
    return await future
           ^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\anyio\_backends\_asyncio.py", line 1002, in run
    result = context.run(func, *args)
             ^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\app\routes\chat.py", line 59, in get_chat_messages
    return db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\query.py", line 2711, in all
    return self._iter().all()  # type: ignore
           ^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\query.py", line 2864, in _iter
    result: Union[ScalarResult[_T], Result[_T]] = self.session.execute(
                                                  ^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\session.py", line 2351, in execute
    return self._execute_internal(
           ^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\session.py", line 2249, in _execute_internal
    result: Result[Any] = compile_state_cls.orm_execute_statement(
                          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\orm\context.py", line 306, in orm_execute_statement
    result = conn.execute(
             ^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1419, in execute
    return meth(
           ^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\sql\elements.py", line 527, in _execute_on_connection
    return connection._execute_clauseelement(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1641, in _execute_clauseelement
    ret = self._execute_context(
          ^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1846, in _execute_context
    return self._exec_single_context(
           ^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1986, in _exec_single_context
    self._handle_dbapi_exception(
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 2363, in _handle_dbapi_exception
    raise sqlalchemy_exception.with_traceback(exc_info[2]) from e
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\base.py", line 1967, in _exec_single_context
    self.dialect.do_execute(
  File "D:\Nisarg.Doc\Skaps\chatbot\backend\venv\Lib\site-packages\sqlalchemy\engine\default.py", line 952, in do_execute
    cursor.execute(statement, parameters)
sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedColumn) column chat_messages.role does not exist
LINE 1: ..._messages.session_id AS chat_messages_session_id, chat_messa...       
                                                             ^

[SQL: SELECT chat_messages.id AS chat_messages_id, chat_messages.session_id AS chat_messages_session_id, chat_messages.role AS chat_messages_role, chat_messages.content AS chat_messages_content, chat_messages.created_at AS chat_messages_created_at
FROM chat_messages
WHERE chat_messages.session_id = %(session_id_1)s ORDER BY chat_messages.created_at ASC]
[parameters: {'session_id_1': 2}]
(Background on this error at: https://sqlalche.me/e/20/f405)