import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Car, Calendar, Users, ArrowRight } from 'lucide-react';

export default function DashboardTab({ user, carpools, eventPools, onNavigate }) {
  const myCarpools = carpools.filter(c => 
    c.members.some(m => m.id === user.registration_no)
  );
  
  const myEvents = eventPools.filter(e => 
    e.members.some(m => m.id === user.registration_no)
  );

  return (
    <div className="space-y-6" data-testid="dashboard-tab">
      <div>
        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome back, {user.name.split(' ')[0]}!</h2>
        <p className="text-slate-600">Here's your activity overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">My Carpools</CardTitle>
            <Car className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{myCarpools.length}</div>
            <Button
              variant="link"
              className="p-0 h-auto mt-2 text-slate-600 hover:text-slate-800"
              onClick={() => onNavigate('carpool')}
              data-testid="view-carpools-btn"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">My Event Pools</CardTitle>
            <Calendar className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{myEvents.length}</div>
            <Button
              variant="link"
              className="p-0 h-auto mt-2 text-slate-600 hover:text-slate-800"
              onClick={() => onNavigate('events')}
              data-testid="view-events-btn"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card className="card-hover border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Available</CardTitle>
            <Users className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{carpools.length + eventPools.length}</div>
            <p className="text-sm text-slate-600 mt-2">
              {carpools.length} carpools, {eventPools.length} events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Recent Carpools</CardTitle>
          </CardHeader>
          <CardContent>
            {myCarpools.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No carpools yet</p>
            ) : (
              <div className="space-y-3">
                {myCarpools.slice(0, 3).map((carpool) => (
                  <div key={carpool.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800">{carpool.source} → {carpool.destination}</p>
                        <p className="text-sm text-slate-600 mt-1">{new Date(carpool.date_time).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                        {carpool.members.length}/{carpool.seats}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-slate-800">Recent Event Pools</CardTitle>
          </CardHeader>
          <CardContent>
            {myEvents.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No event pools yet</p>
            ) : (
              <div className="space-y-3">
                {myEvents.slice(0, 3).map((event) => (
                  <div key={event.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-800">{event.event_name}</p>
                        <p className="text-sm text-slate-600 mt-1">{new Date(event.event_date).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                        {event.members.length}/{event.members_needed}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
