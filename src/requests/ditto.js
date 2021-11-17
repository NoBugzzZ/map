const dittoApi='http://localhost:8080/'

export function subcribe(id,onChange){
  let source = new EventSource(dittoApi+'api/2/things?fields=thingId,features/通过站点信息&ids='+id, { withCredentials: true });
    source.onmessage = function (event) {
      onChange(event.data);
    };
  return source
}